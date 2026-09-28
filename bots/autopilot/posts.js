import { pick, xLength, hashtag } from "./text.js";

export const SITE = "https://www.livewave.fr";
export const chatUrl = (slug) => `${SITE}/chat/${encodeURIComponent(slug)}`;

const MIN = 60000;

// Moments de publication pour un evenement, relatifs au debut
export function eventSlots(event) {
  const start = new Date(event.datestart).getTime();
  const duration = (new Date(event.dateend).getTime() - start) / MIN;
  if (event.kind === "match") {
    const slots = [
      { slot: "pre", at: start - 30 * MIN },
      { slot: "kickoff", at: start + 3 * MIN },
    ];
    if (duration >= 90) slots.push({ slot: "half", at: start + 50 * MIN });
    return slots;
  }
  const slots = [
    { slot: "pre", at: start - 20 * MIN },
    { slot: "live", at: start + 10 * MIN },
  ];
  if (duration >= 100) slots.push({ slot: "mid", at: start + Math.round(duration / 2) * MIN });
  return slots;
}

const TEMPLATES = {
  match: {
    pre: [
      "⚽ Ce soir {time} sur {channel} : {display} !\nViens vivre le match avec les autres supporters, en direct 👇\n{url}\n{tags}",
      "{display} dans 30 minutes sur {channel} 🔥\nLe chat du match est ouvert, rejoins-nous pour commenter chaque action 👇\n{url}\n{tags}",
      "Qui gagne ce soir ? {display}, {time} sur {channel} ⚽\nPronostics et réactions en direct sur LiveWave 👇\n{url}\n{tags}",
    ],
    kickoff: [
      "🔴 C'est parti ! {display} en direct sur {channel}\nRéagis à chaque action avec les autres téléspectateurs 👇\n{url}\n{tags}",
      "Coup d'envoi de {display} ⚽\nOn commente le match ensemble, en temps réel 👇\n{url}\n{tags}",
    ],
    half: [
      "⏱️ {display} : ça se joue maintenant sur {channel}\nTon avis sur le match ? Viens en parler en direct 👇\n{url}\n{tags}",
      "Le match {display} bat son plein 🔥\nRejoins le chat des supporters sur LiveWave 👇\n{url}\n{tags}",
    ],
  },
  show: {
    pre: [
      "📺 {display} ce soir {time} sur {channel}\nRegarde-le avec nous et commente en direct avec les autres téléspectateurs 👇\n{url}\n{tags}",
      "Rendez-vous {time} sur {channel} pour {display} 🍿\nLe chat en direct est ouvert 👇\n{url}\n{tags}",
    ],
    live: [
      "🔴 C'est l'heure de {display} sur {channel} !\nViens réagir en direct avec les autres fans 👇\n{url}\n{tags}",
      "Tu regardes {display} ? 👀\nOn en parle en direct sur LiveWave 👇\n{url}\n{tags}",
    ],
    mid: [
      "💬 {display} : ça débat fort en ce moment\nDonne ton avis en direct 👇\n{url}\n{tags}",
    ],
  },
  trend: [
    "🔥 {display} est en tendance en France\nOn en parle en direct sur LiveWave, viens donner ton avis 👇\n{url}\n{tags}",
    "Tout le monde parle de {display} 👀\nRejoins la discussion en temps réel 👇\n{url}\n{tags}",
    "{display} en top tendance 📈\nLe chat en direct est ouvert sur LiveWave 👇\n{url}\n{tags}",
  ],
};

const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

function fit(text) {
  let t = text;
  while (xLength(t) > 280 && /\n[^\n]*#\S+\s*$/.test(t)) t = t.replace(/\s+#\S+\s*$/, "");
  return t.trim();
}

export function eventPost(event, slot) {
  const tpls = TEMPLATES[event.kind === "match" ? "match" : "show"][slot] || TEMPLATES.show.live;
  return fit(
    fill(pick(tpls), {
      display: event.nameformat,
      time: event.time || "",
      channel: event.channel || "",
      url: chatUrl(event.name),
      tags: `${event.hashtags || ""} #LiveWave`.trim(),
    })
  );
}

export function trendPost(trend) {
  return fit(
    fill(pick(TEMPLATES.trend), {
      display: trend.title,
      url: chatUrl(trend.slug),
      tags: `${hashtag(trend.title)} #LiveWave`,
    })
  );
}
