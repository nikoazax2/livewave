// LiveWave autopilot : tendances X + programme TV -> salons + posts X / Bluesky
//
//   node bots/autopilot.js preview   affiche ce qui serait cree et publie (aucune ecriture)
//   node bots/autopilot.js refresh   met a jour tendances, evenements et salons dans Supabase
//   node bots/autopilot.js post      publie les posts dus maintenant
//   node bots/autopilot.js run       boucle continue (pm2) : refresh + post
//   node bots/autopilot.js tick      un passage (cron / GitHub Actions) : refresh si besoin + post
//
// Variables (.env) : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TWITTER_*_2, BSKY_IDENTIFIER, BSKY_PASSWORD
//   LIVE=1 pour publier reellement (sinon mode test), X_DAILY_LIMIT (15), TRENDS_PER_DAY (4), TREND_GAP_MIN (45),
//   POST_MIN_PRIORITY (3 : pas de post pour les feuilletons quotidiens)

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { fetchTrends, isSensitive } from "./autopilot/trends.js";
import { fetchTonight } from "./autopilot/tvguide.js";
import { selectEvents } from "./autopilot/select.js";
import { eventSlots, eventPost, trendPost, chatUrl } from "./autopilot/posts.js";
import { postX, postBsky, getX, hasBsky } from "./autopilot/publish.js";
import { parisDate } from "./autopilot/text.js";
import { ogImageUrl } from "../api/share.js";

dotenv.config();

const LIVE = process.env.LIVE === "1";
const X_DAILY_LIMIT = Number(process.env.X_DAILY_LIMIT || 15);
const TRENDS_PER_DAY = Number(process.env.TRENDS_PER_DAY || 4);
const TREND_GAP_MIN = Number(process.env.TREND_GAP_MIN || 45);
const POST_MIN_PRIORITY = Number(process.env.POST_MIN_PRIORITY || 3);
const SLOT_TOLERANCE_MIN = 40;
const MIN = 60000;

const INDEXNOW_KEY = "a700ca32eea4e4fe8c19ed97f938b742";

// Signale les nouvelles pages aux moteurs compatibles IndexNow (Bing, Yandex, Seznam...)
async function indexNow(urls) {
  if (!LIVE || !urls.length) return;
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: "www.livewave.fr", key: INDEXNOW_KEY, keyLocation: `https://www.livewave.fr/${INDEXNOW_KEY}.txt`, urlList: urls }),
    });
    log(`IndexNow : ${urls.length} url(s) -> ${res.status}`);
  } catch (e) {
    log("IndexNow echec :", e.message);
  }
}

const log = (...a) => console.log(new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" }), ...a);

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const db = serviceKey && !serviceKey.startsWith("COLLER")
  ? createClient(process.env.SUPABASE_URL, serviceKey, { auth: { persistSession: false } })
  : null;

const requireDb = () => {
  if (!db) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante dans .env");
  return db;
};

function withOg(event) {
  const time = `Ce soir ${event.time}`;
  return {
    ...event,
    og: ogImageUrl(
      event.team_a
        ? { teamA: event.team_a, teamB: event.team_b, channel: event.channel, time, subtitle: event.subtitle }
        : { title: event.nameformat, channel: event.channel, time, subtitle: event.subtitle || "Le chat en direct" }
    ),
  };
}

async function buildEvents() {
  return selectEvents(await fetchTonight()).map(withOg);
}

async function ensureChat(slug, display, description) {
  const { data } = await requireDb().from("chats").select("id").ilike("title", slug).limit(1);
  if (data?.length) {
    await db.from("chats").update({ title_full: display }).eq("id", data[0].id);
    return;
  }
  const { error } = await db.from("chats").insert({ title: slug, title_full: display, description });
  if (error) throw error;
}

export async function refresh() {
  const client = requireDb();

  const trends = await fetchTrends(10);
  const fetched_at = new Date().toISOString();
  const { error: tErr } = await client.from("trends").insert(trends.map((t) => ({ ...t, fetched_at })));
  if (tErr) throw tErr;
  for (const t of trends) await ensureChat(t.slug, t.title, "En tendance sur X en France");
  log(`tendances : ${trends.map((t) => t.title).join(", ")}`);

  const events = await buildEvents();
  const { data: existing } = await client.from("events").select("name, og").in("name", events.map((e) => e.name));
  const customOg = new Map((existing || []).filter((x) => x.og?.includes("bg=")).map((x) => [x.name, x.og]));
  for (const e of events) {
    if (customOg.has(e.name)) e.og = customOg.get(e.name);
    const { subtitle, time, ...row } = e;
    const { error } = await client.from("events").upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "name" });
    if (error) throw error;
    await ensureChat(e.name, e.nameformat, e.subtitle ? `${e.subtitle} · ${e.channel} ${e.time}` : `${e.channel} ${e.time}`);
  }
  log(`evenements : ${events.map((e) => `${e.nameformat} (${e.channel} ${e.time})`).join(", ")}`);
  await indexNow(["https://www.livewave.fr/", ...events.map((e) => chatUrl(e.name)), ...trends.map((t) => chatUrl(t.slug))]);
  return { trends, events };
}

async function sentInLast24h(network) {
  const { count } = await requireDb()
    .from("social_posts")
    .select("id", { count: "exact", head: true })
    .eq("network", network)
    .eq("status", "sent")
    .gte("created_at", new Date(Date.now() - 24 * 60 * MIN).toISOString());
  return count || 0;
}

async function publishOne({ network, ref, slot, text, card }) {
  const name = LIVE ? network : `${network}-test`;
  const { data: row, error } = await db.from("social_posts").insert({ network: name, ref, slot, text }).select().single();
  if (error) {
    if (error.code === "23505") return "deja fait";
    throw error;
  }
  if (!LIVE) {
    await db.from("social_posts").update({ status: "test" }).eq("id", row.id);
    log(`[TEST ${network}] ${ref}/${slot}\n${text}\n`);
    return "test";
  }
  try {
    const id = network === "x" ? await postX(text) : await postBsky(text, card);
    await db.from("social_posts").update({ status: "sent", external_id: id }).eq("id", row.id);
    log(`[${network}] publie ${ref}/${slot} -> ${id}`);
    return "sent";
  } catch (e) {
    const msg = JSON.stringify(e.data || e.message).slice(0, 500);
    await db.from("social_posts").update({ status: "failed", error: msg }).eq("id", row.id);
    log(`[${network}] echec ${ref}/${slot} : ${msg}`);
    return "failed";
  }
}

export async function post() {
  const client = requireDb();
  const now = Date.now();
  const networks = [...(getX() ? ["x"] : []), ...(hasBsky() ? ["bluesky"] : [])];
  if (!networks.length) log("aucun reseau configure : posts generes en test uniquement");

  const { data: events } = await client
    .from("events")
    .select("*")
    .gte("dateend", new Date(now - 3 * 60 * MIN).toISOString())
    .lte("datestart", new Date(now + 60 * MIN).toISOString());

  const due = [];
  let upcomingToday = 0;
  for (const e of events || []) {
    if ((e.priority ?? 3) < POST_MIN_PRIORITY) continue;
    const time = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "numeric", minute: "2-digit" })
      .format(new Date(e.datestart))
      .replace(":", "h")
      .replace(/h00$/, "h");
    for (const s of eventSlots(e)) {
      if (s.at > now) upcomingToday++;
      if (s.at <= now && now - s.at <= SLOT_TOLERANCE_MIN * MIN) {
        due.push({ ref: `event:${e.name}:${parisDate(new Date(e.datestart))}`, slot: s.slot, text: eventPost({ ...e, time }, s.slot), event: e });
      }
    }
  }

  // Tendances : seulement s'il reste du budget apres les evenements du jour
  const xUsed = await sentInLast24h("x");
  const budget = X_DAILY_LIMIT - xUsed - upcomingToday;
  const today = parisDate();
  const { data: lastTrendPost } = await client
    .from("social_posts")
    .select("created_at")
    .like("ref", "trend:%")
    .order("created_at", { ascending: false })
    .limit(1);
  const gapOk = !lastTrendPost?.length || now - new Date(lastTrendPost[0].created_at).getTime() >= TREND_GAP_MIN * MIN;
  const { data: trendRows } = await client
    .from("social_posts")
    .select("ref")
    .like("ref", `trend:%:${today}`)
    .in("network", LIVE ? ["x", "bluesky"] : ["x-test", "bluesky-test"]);
  const trendsToday = new Set((trendRows || []).map((r) => r.ref)).size;

  if (!due.length && gapOk && budget > 0 && trendsToday < TRENDS_PER_DAY) {
    const { data: latest } = await client.from("trends").select("*").order("fetched_at", { ascending: false }).order("rank").limit(10);
    const { data: done } = await client.from("social_posts").select("ref").like("ref", `trend:%:${today}`);
    const doneRefs = new Set((done || []).map((d) => d.ref));
    const next = (latest || []).find((t) => !doneRefs.has(`trend:${t.slug}:${today}`) && !isSensitive(t.title));
    if (next) due.push({ ref: `trend:${next.slug}:${today}`, slot: "day", text: trendPost(next), trend: next });
  }

  for (const d of due) {
    const slug = d.event?.name || d.trend.slug;
    const card = {
      url: chatUrl(slug),
      title: `${d.event?.nameformat || d.trend.title} : le chat en direct`,
      description: "Rejoins les téléspectateurs et réagis en temps réel sur LiveWave.",
      image: d.event?.og || ogImageUrl({ title: d.trend.title, badge: "TENDANCE", subtitle: "En tendance en France" }),
    };
    for (const network of networks.length ? networks : ["x"]) {
      if (network === "x" && LIVE && (await sentInLast24h("x")) >= X_DAILY_LIMIT) {
        log(`plafond X atteint (${X_DAILY_LIMIT}/24h), ${d.ref}/${d.slot} ignore`);
        continue;
      }
      await publishOne({ network, ref: d.ref, slot: d.slot, text: d.text, card });
    }
  }
  if (!due.length) log("rien a publier");
}

export async function preview() {
  const [trends, events] = await Promise.all([fetchTrends(10), buildEvents()]);
  console.log(`\n=== Top 10 tendances X France ===`);
  trends.forEach((t) => console.log(`${t.rank}. ${t.title}  ->  ${chatUrl(t.slug)}${isSensitive(t.title) ? "  (sensible : jamais poste)" : ""}`));
  console.log(`\n=== Evenements TV du jour ===`);
  for (const e of events) {
    console.log(`\n# ${e.nameformat} (${e.kind}) ${e.channel} ${e.time}  ->  ${chatUrl(e.name)}`);
    console.log(`  OG : ${e.og}`);
    for (const s of eventSlots(e)) {
      console.log(`\n  [${s.slot} ${new Date(s.at).toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" })}]`);
      console.log(eventPost(e, s.slot).replace(/^/gm, "    "));
    }
  }
  console.log(`\n=== Exemple post tendance ===\n${trendPost(trends[0])}\n`);
}

// Un passage unique, pour un planificateur externe
async function tick() {
  const { data } = await requireDb().from("trends").select("fetched_at").order("fetched_at", { ascending: false }).limit(1);
  const last = data?.[0] ? new Date(data[0].fetched_at).getTime() : 0;
  if (Date.now() - last >= 55 * MIN) await refresh();
  await post();
}

async function run() {
  log(`autopilot lance (${LIVE ? "PUBLICATION REELLE" : "mode test"})`);
  let lastRefresh = 0;
  const tick = async () => {
    try {
      if (Date.now() - lastRefresh >= 60 * MIN) {
        await refresh();
        lastRefresh = Date.now();
      }
      await post();
    } catch (e) {
      log("erreur :", e.message);
    }
  };
  await tick();
  setInterval(tick, 2 * MIN);
}

const cmd = process.argv[2] || "preview";
const actions = { preview, refresh, post, run, tick };
if (!actions[cmd]) {
  console.error(`commande inconnue : ${cmd} (preview | refresh | post | run | tick)`);
  process.exit(1);
}
await actions[cmd]();
if (cmd !== "run") process.exit(0);
