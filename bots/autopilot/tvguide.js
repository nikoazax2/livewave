import { gunzipSync } from "zlib";
import { parisDate } from "./text.js";

const SOURCE = "https://xmltvfr.fr/xmltv/xmltv_tnt.xml.gz";

export const CHANNELS = {
  "TF1.fr": "TF1",
  "France2.fr": "France 2",
  "France3.fr": "France 3",
  "CanalPlus.fr": "Canal+",
  "France5.fr": "France 5",
  "M6.fr": "M6",
  "Arte.fr": "Arte",
  "W9.fr": "W9",
  "TMC.fr": "TMC",
  "NT1.fr": "TFX",
  "France4.fr": "France 4",
  "LEquipe21.fr": "L'Équipe",
  "6ter.fr": "6ter",
  "Gulli.fr": "Gulli",
  "CanalPlusSport.fr": "Canal+ Sport",
  "RMCDecouverte.fr": "RMC Découverte",
  "TF1SeriesFilms.fr": "TF1 Séries Films",
  "BFMTV.fr": "BFMTV",
  "CNews.fr": "CNews",
  "LCI.fr": "LCI",
  "FranceInfo.fr": "franceinfo",
};

const decode = (s = "") =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

// "20260928203500 +0200" -> Date
const parseXmltvDate = (s) => {
  const m = s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{2})(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi, se, oh, om] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${se}${oh}:${om}`);
};

const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : "";
};

// Programmes TNT du jour (heure de Paris)
export async function fetchTonight({ day = new Date() } = {}) {
  const res = await fetch(SOURCE, { headers: { "User-Agent": "Mozilla/5.0 (LiveWave bot)" } });
  if (!res.ok) throw new Error(`xmltvfr ${res.status}`);
  const xml = gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8");
  const today = parisDate(day);

  const programmes = [];
  for (const m of xml.matchAll(/<programme start="([^"]+)" stop="([^"]+)" channel="([^"]+)">([\s\S]*?)<\/programme>/g)) {
    const [, startRaw, stopRaw, channelId, body] = m;
    if (!CHANNELS[channelId]) continue;
    const start = parseXmltvDate(startRaw);
    const stop = parseXmltvDate(stopRaw);
    if (!start || !stop || parisDate(start) !== today) continue;
    programmes.push({
      start,
      stop,
      channelId,
      channel: CHANNELS[channelId],
      title: tag(body, "title"),
      subTitle: tag(body, "sub-title"),
      desc: tag(body, "desc"),
      categories: [...body.matchAll(/<category[^>]*>([^<]+)<\/category>/g)].map((c) => decode(c[1])),
      icon: body.match(/<icon src="([^"]+)"/)?.[1] || null,
    });
  }
  return programmes;
}
