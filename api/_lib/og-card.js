import { ImageResponse } from "@vercel/og";

const FONT_URLS = {
  display: "https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-700-normal.woff",
  body: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.woff",
};

let fontsPromise;
const loadFonts = () => {
  fontsPromise ||= Promise.all(
    Object.entries(FONT_URLS).map(async ([name, url]) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`font ${name}: ${res.status}`);
      return { name, data: await res.arrayBuffer() };
    })
  ).catch((e) => {
    fontsPromise = null;
    throw e;
  });
  return fontsPromise;
};

const FLAGS = {
  france: "🇫🇷", belgique: "🇧🇪", italie: "🇮🇹", espagne: "🇪🇸", allemagne: "🇩🇪", angleterre: "🏴",
  portugal: "🇵🇹", "pays-bas": "🇳🇱", suisse: "🇨🇭", croatie: "🇭🇷", turquie: "🇹🇷", maroc: "🇲🇦",
  algerie: "🇩🇿", tunisie: "🇹🇳", senegal: "🇸🇳", bresil: "🇧🇷", argentine: "🇦🇷", "etats-unis": "🇺🇸",
  japon: "🇯🇵", irlande: "🇮🇪", ecosse: "🏴", "pays de galles": "🏴", autriche: "🇦🇹", danemark: "🇩🇰",
  suede: "🇸🇪", norvege: "🇳🇴", pologne: "🇵🇱", ukraine: "🇺🇦", grece: "🇬🇷", serbie: "🇷🇸",
  "nouvelle-zelande": "🇳🇿", "afrique du sud": "🇿🇦", australie: "🇦🇺", "cote d'ivoire": "🇨🇮", cameroun: "🇨🇲",
};

const normalize = (s = "") => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const flagFor = (team) => FLAGS[normalize(team)] || null;

const h = (type, style, ...children) => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.flat().filter((c) => c !== null && c !== false && c !== undefined) },
});

// Champ de points en perspective, rappel du fond 3D du site
function waveSvg() {
  const dots = [];
  for (let row = 0; row < 16; row++) {
    const z = row / 15;
    const y = 360 + z * z * 290;
    const spacing = 10 + z * 34;
    const r = 0.8 + z * 3.2;
    for (let x = -60; x < 1260; x += spacing) {
      const wave = Math.sin(x / 90 + row * 0.7) * (8 + z * 22) + Math.sin(x / 37 - row) * 4 * z;
      const t = (Math.sin(x / 180 + row / 3) + 1) / 2;
      const color = t > 0.72 ? "#ff3d8b" : t > 0.38 ? "#8b3dff" : "#4d7cff";
      dots.push(`<circle cx="${x.toFixed(1)}" cy="${(y + wave).toFixed(1)}" r="${r.toFixed(2)}" fill="${color}" fill-opacity="${(0.25 + z * 0.6).toFixed(2)}"/>`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">${dots.join("")}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const WAVE = waveSvg();

function teamBlock(name, align) {
  const flag = flagFor(name);
  return h(
    "div",
    { flexDirection: "column", alignItems: align, gap: 14, flex: 1 },
    flag ? h("div", { fontSize: 96, lineHeight: 1 }, flag) : null,
    h(
      "div",
      { fontFamily: "display", fontSize: name.length > 11 ? 64 : 84, color: "#f3f4ff", letterSpacing: -2, lineHeight: 1, textAlign: align === "flex-end" ? "right" : "left" },
      name.toUpperCase()
    )
  );
}

// Photo de fond optionnelle, convertie en data URI pour un rendu fiable
async function loadBackground(url) {
  if (!url || !/^https:\/\//.test(url)) return null;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "LiveWave OG" } });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 4 * 1024 * 1024) return null;
    return `data:${type.split(";")[0]};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function renderCard(params) {
  const photo = await loadBackground(params.bg);
  return renderCardSync({ ...params, photo });
}

function renderCardSync({ title = "LiveWave", subtitle = "", teamA, teamB, channel, time, badge = "EN DIRECT", photo }) {
  const isMatch = teamA && teamB;
  const meta = [channel, time].filter(Boolean).join("  ·  ");

  const main = isMatch
    ? h(
        "div",
        { alignItems: "center", width: "100%", gap: 30 },
        teamBlock(teamA, "flex-end"),
        h(
          "div",
          {
            width: 110,
            height: 110,
            borderRadius: 55,
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "display",
            fontSize: 40,
            color: "white",
            backgroundImage: "linear-gradient(135deg, #4d7cff, #8b3dff 55%, #ff3d8b)",
            boxShadow: "0 0 60px rgba(139,61,255,0.8)",
          },
          "VS"
        ),
        teamBlock(teamB, "flex-start")
      )
    : h(
        "div",
        { flexDirection: "column", alignItems: "center", width: "100%" },
        h(
          "div",
          {
            fontFamily: "display",
            fontSize: title.length > 26 ? 70 : title.length > 16 ? 88 : 110,
            lineHeight: 1.02,
            letterSpacing: -3,
            textAlign: "center",
            justifyContent: "center",
            color: "#f3f4ff",
            maxWidth: 1060,
          },
          title
        ),
        subtitle ? h("div", { marginTop: 18, fontSize: 30, color: "rgba(226,228,255,0.7)", textAlign: "center", maxWidth: 900 }, subtitle) : null
      );

  const element = h(
    "div",
    {
      width: 1200,
      height: 630,
      position: "relative",
      flexDirection: "column",
      fontFamily: "body",
      color: "#f3f4ff",
      backgroundColor: "#05060f",
      backgroundImage:
        "radial-gradient(circle at 20% 0%, rgba(77,124,255,0.45), transparent 45%), radial-gradient(circle at 85% 10%, rgba(255,61,139,0.35), transparent 45%), radial-gradient(circle at 50% 110%, rgba(139,61,255,0.55), transparent 55%)",
    },
    photo
      ? { type: "img", props: { src: photo, width: 1200, height: 630, style: { position: "absolute", top: 0, left: 0, objectFit: "cover" } } }
      : null,
    photo
      ? h("div", {
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          backgroundImage:
            "linear-gradient(180deg, rgba(5,6,15,0.78) 0%, rgba(5,6,15,0.35) 38%, rgba(5,6,15,0.55) 62%, rgba(5,6,15,0.95) 100%), linear-gradient(120deg, rgba(77,124,255,0.28), rgba(139,61,255,0.18) 50%, rgba(255,61,139,0.28))",
        })
      : null,
    { type: "img", props: { src: WAVE, width: 1200, height: 630, style: { position: "absolute", top: 0, left: 0, opacity: photo ? 0.45 : 1 } } },
    h(
      "div",
      { position: "absolute", top: 0, left: 0, width: 1200, height: 630, flexDirection: "column", padding: "44px 56px" },
      h(
        "div",
        { justifyContent: "space-between", alignItems: "center", width: "100%" },
        h(
          "div",
          { alignItems: "center", gap: 14 },
          h("div", { width: 18, height: 18, borderRadius: 9, backgroundImage: "linear-gradient(135deg, #4d7cff, #ff3d8b)" }),
          h("div", { fontFamily: "display", fontSize: 34, letterSpacing: 1 }, "LIVEWAVE")
        ),
        h(
          "div",
          {
            alignItems: "center",
            gap: 12,
            padding: "10px 22px",
            borderRadius: 999,
            backgroundColor: "rgba(255,71,87,0.16)",
            border: "2px solid rgba(255,71,87,0.55)",
            fontSize: 24,
            color: "#ffd6da",
            letterSpacing: 2,
          },
          h("div", { width: 14, height: 14, borderRadius: 7, backgroundColor: "#ff4757", boxShadow: "0 0 16px #ff4757" }),
          badge
        )
      ),
      h("div", { flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 26 }, main,
        meta
          ? h(
              "div",
              {
                padding: "12px 28px",
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: 28,
                color: "#e8e9ff",
              },
              meta
            )
          : null
      ),
      h(
        "div",
        { justifyContent: "space-between", alignItems: "center", width: "100%" },
        h("div", { fontSize: 28, color: "rgba(226,228,255,0.75)" }, "Le chat en direct des téléspectateurs"),
        h(
          "div",
          {
            padding: "14px 30px",
            borderRadius: 999,
            fontFamily: "display",
            fontSize: 28,
            color: "white",
            backgroundImage: "linear-gradient(120deg, #4d7cff, #8b3dff 55%, #ff3d8b)",
          },
          "livewave.fr  →"
        )
      )
    )
  );

  return loadFonts().then(
    (fonts) =>
      new ImageResponse(element, {
        width: 1200,
        height: 630,
        emoji: "twemoji",
        fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.name === "display" ? 700 : 600, style: "normal" })),
        headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
      })
  );
}

export function cardParamsFromQuery(searchParams) {
  const get = (k) => (searchParams.get(k) || "").slice(0, 80) || undefined;
  return {
    title: get("title"),
    subtitle: get("subtitle"),
    teamA: get("a"),
    teamB: get("b"),
    channel: get("channel"),
    time: get("time"),
    badge: get("badge"),
    bg: (searchParams.get("bg") || "").slice(0, 500) || undefined,
  };
}
