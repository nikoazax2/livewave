import { slugify } from "./text.js";

const SOURCE = "https://trends24.in/france/";

// Sujets qu'on ne transforme jamais en post promotionnel (deces, drames, contenus adultes...)
const SENSITIVE_WORDS = [
  "rip", "mort", "morte", "morts", "décès", "deces", "décédé", "décédée", "decede", "tué", "tuée", "tués", "meurtre",
  "assassin\\p{L}*", "attentat\\p{L}*", "terroris\\p{L}*", "fusillade", "crash", "accident\\p{L}*", "victimes?", "viols?",
  "drame", "deuil", "hommage", "incendie", "séisme", "seisme", "guerre", "otages?", "suicide", "pédo\\p{L}*", "pedo\\p{L}*",
  "nsfw", "porn\\p{L}*", "obsèques", "obseques", "disparition", "agression", "massacre", "bombardement",
];

// Tendances sponsorisees ou promotionnelles (paris, casino, concours, codes promo...)
const PROMO = /(bets(?![a-z])|(?<![a-z])bet(?![a-z])|betclic|winamax|unibet|parionssport|pmu|casino|poker|paris ?sportifs?|freebets?|cashback|code ?promo|promo ?code|giveaway|jeu ?concours|concours|airdrop|sponsoris)/i;
const SENSITIVE = new RegExp(`(?<![\\p{L}\\p{N}])(${SENSITIVE_WORDS.join("|")})(?![\\p{L}\\p{N}])`, "iu");

// "#RIPPac" -> "RIP Pac" pour que le filtre voie les mots
export const isSensitive = (title) =>
  PROMO.test(title) ||
  SENSITIVE.test(
    title
      .replace(/^#/, "")
      .replace(/([\p{Ll}])([\p{Lu}])/gu, "$1 $2")
      .replace(/([\p{Lu}]+)([\p{Lu}][\p{Ll}])/gu, "$1 $2")
  );

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

// Top tendances X en France (derniere heure) depuis trends24.in
export async function fetchTrends(limit = 10) {
  const res = await fetch(SOURCE, { headers: { "User-Agent": "Mozilla/5.0 (LiveWave bot)" } });
  if (!res.ok) throw new Error(`trends24 ${res.status}`);
  const html = await res.text();

  const firstList = html.match(/<ol class=["']?trend-card__list["']?>([\s\S]*?)<\/ol>/);
  const scope = firstList ? firstList[1] : html;
  const items = [...scope.matchAll(/<li[\s\S]*?class=["']?trend-link["']?[^>]*>([^<]+)<\/a>([\s\S]*?)<\/li>/g)];

  const seen = new Set();
  const trends = [];
  for (const [, rawName, rest] of items) {
    const title = decode(rawName);
    const slug = slugify(title);
    if (!slug || seen.has(slug.toLowerCase())) continue;
    seen.add(slug.toLowerCase());
    const count = rest.match(/tweet-count[^>]*data-count=["']?(\d+)/) || rest.match(/tweet-count[^>]*>([^<]+)</);
    trends.push({ rank: trends.length + 1, title, slug, volume: count ? decode(count[1]) : null });
    if (trends.length >= limit) break;
  }
  if (!trends.length) throw new Error("trends24: aucune tendance trouvee (format de page change ?)");
  return trends;
}
