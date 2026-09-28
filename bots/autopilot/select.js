import { readFileSync } from "fs";
import { slugify, stripAccents, parisHour, parisMinutes } from "./text.js";

const config = JSON.parse(readFileSync(new URL("./shows.json", import.meta.url), "utf8"));

const COUNTRY_CODES = {
  france: "FRA", belgique: "BEL", italie: "ITA", espagne: "ESP", allemagne: "GER", angleterre: "ENG", portugal: "POR",
  "pays-bas": "NED", suisse: "SUI", croatie: "CRO", turquie: "TUR", maroc: "MAR", algerie: "ALG", tunisie: "TUN",
  senegal: "SEN", bresil: "BRA", argentine: "ARG", "etats-unis": "USA", japon: "JPN", irlande: "IRL", ecosse: "SCO",
  "pays de galles": "WAL", autriche: "AUT", danemark: "DEN", suede: "SWE", norvege: "NOR", pologne: "POL", ukraine: "UKR",
  grece: "GRE", serbie: "SRB", "nouvelle-zelande": "NZL", "afrique du sud": "RSA", australie: "AUS", "cote d'ivoire": "CIV",
  cameroun: "CMR", islande: "ISL", finlande: "FIN", hongrie: "HUN", "republique tcheque": "CZE", slovaquie: "SVK",
  slovenie: "SVN", roumanie: "ROU", bulgarie: "BUL", israel: "ISR", kazakhstan: "KAZ", luxembourg: "LUX", georgie: "GEO",
};

const norm = (s = "") => stripAccents(s).toLowerCase().trim();
const isCountry = (s) => !!COUNTRY_CODES[norm(s)];
const capitalize = (s) => s.replace(/(^|[\s-])(\p{L})/gu, (m, p, c) => p + c.toUpperCase());
const minutes = (p) => (p.stop - p.start) / 60000;

const COUNTRY_WORD = "([A-ZÉÈÎÔ][\\p{L}'-]+(?:[ -](?:du |de |d')?[A-ZÉÈÎÔ][\\p{L}'-]+)?)";

// Devine les deux equipes (domicile d'abord) depuis le titre ou la description
export function parseTeams(p) {
  for (const s of [p.subTitle, p.title]) {
    const m = s?.match(/^(.{2,30}?)\s+(?:\/|-|–|vs\.?|contre)\s+(.{2,30})$/i);
    if (m && !/:/.test(m[1])) return { teamA: m[1].trim(), teamB: m[2].trim() };
  }
  const d = p.desc || "";
  const france = /\b(les Bleus|l'équipe de France|les Bleues|équipe de France)\b/i.test(d);
  if (!france) return null;
  const away = d.match(new RegExp(`déplacement (?:en|au|aux|à) ${COUNTRY_WORD}`, "u"));
  if (away && isCountry(away[1])) return { teamA: capitalize(away[1]), teamB: "France" };
  const home = d.match(new RegExp(`(?:face à|contre|reçoivent|accueillent) (?:la |le |les |l')?${COUNTRY_WORD}`, "u"));
  if (home && isCountry(home[1])) return { teamA: "France", teamB: capitalize(home[1]) };
  return null;
}

const matchHashtags = (a, b) => {
  const ca = COUNTRY_CODES[norm(a)];
  const cb = COUNTRY_CODES[norm(b)];
  const tags = [];
  if (ca && cb) tags.push(`#${ca}${cb}`);
  tags.push(`#${slugify(`${a} ${b}`)}`);
  if (norm(a) === "france" || norm(b) === "france") tags.push("#TeamFrance");
  return tags.join(" ");
};

const shortDesc = (d = "") => (d.length > 180 ? `${d.slice(0, 177).replace(/\s+\S*$/, "")}...` : d);

function toEvent(p, { kind, name, hashtags, teams, priority, subtitle }) {
  const display = teams ? `${teams.teamA} - ${teams.teamB}` : name;
  return {
    priority,
    name: slugify(display),
    nameformat: display,
    kind,
    channel: p.channel,
    datestart: p.start.toISOString(),
    dateend: p.stop.toISOString(),
    description: shortDesc(p.desc),
    hashtags: hashtags || `#${slugify(display)}`,
    team_a: teams?.teamA || null,
    team_b: teams?.teamB || null,
    subtitle: subtitle || null,
    time: parisHour(p.start),
    source: "xmltv",
  };
}

export function selectEvents(programmes) {
  const candidates = [];

  for (const p of programmes) {
    const cats = p.categories.join(" ");
    const text = `${p.title} ${p.subTitle} ${p.desc}`;
    const start = parisMinutes(p.start);

    const isSport = config.sportKeywords.some((k) => cats.includes(k) || p.title.includes(k)) && !/magazine|après[- ]match|avant[- ]match|résumé/i.test(`${cats} ${p.title}`);
    if (isSport && minutes(p) >= 60 && start >= 12 * 60 && config.bigTeams.some((t) => new RegExp(`\\b${t}\\b`).test(text))) {
      const teams = parseTeams(p);
      if (!teams) continue;
      const competition = p.title.replace(/^[^:]+:\s*/, "");
      candidates.push(
        toEvent(p, {
          kind: "match",
          teams,
          hashtags: matchHashtags(teams.teamA, teams.teamB),
          priority: 5,
          subtitle: competition !== p.title ? competition : null,
        })
      );
      continue;
    }

    const show = config.shows.find((s) => new RegExp(s.match, "i").test(p.title));
    if (show && minutes(p) >= 20 && start >= 17 * 60) {
      candidates.push(toEvent(p, { kind: "show", name: show.name, hashtags: show.hashtags, priority: show.weight ?? 3 }));
      continue;
    }

    const prime = config.primeTimeChannels.includes(p.channelId) && start >= 20 * 60 + 30 && start <= 21 * 60 + 30 && minutes(p) >= 50;
    if (prime && config.primeTimeCategories.some((c) => cats.includes(c))) {
      candidates.push(toEvent(p, { kind: "show", name: p.title, priority: 2 }));
    }
  }

  // Fusionne les rediffusions et parties successives d'une meme emission
  const byName = new Map();
  for (const e of candidates) {
    const prev = byName.get(e.name);
    if (!prev) byName.set(e.name, e);
    else if (new Date(e.datestart) - new Date(prev.dateend) <= 30 * 60000) prev.dateend = e.dateend;
  }

  return [...byName.values()]
    .sort((a, b) => b.priority - a.priority || new Date(a.datestart) - new Date(b.datestart))
    .slice(0, config.maxEvents);
}
