const SITE = "https://www.livewave.fr";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function rest(path) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  return res.ok ? res.json() : [];
}

export function ogImageUrl({ title, teamA, teamB, channel, time, subtitle, badge }) {
  const q = new URLSearchParams();
  if (teamA && teamB) {
    q.set("a", teamA);
    q.set("b", teamB);
  } else if (title) q.set("title", title);
  if (subtitle) q.set("subtitle", subtitle);
  if (channel) q.set("channel", channel);
  if (time) q.set("time", time);
  if (badge) q.set("badge", badge);
  return `${SITE}/api/og?${q}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = decodeURIComponent(searchParams.get("id") || "").slice(0, 120);

  let chat = null;
  if (UUID.test(id)) [chat] = await rest(`chats?id=eq.${id}&select=*`);
  else if (id) [chat] = await rest(`chats?title=ilike.${encodeURIComponent(id)}&select=*&limit=1`);
  const name = chat?.title || id;
  const [event] = name ? await rest(`events?name=eq.${encodeURIComponent(name)}&select=*&limit=1`) : [];

  const display = event?.nameformat || chat?.title_full || chat?.title || id || "LiveWave";
  const title = `${display} : le chat en direct | LiveWave`;
  const description =
    event?.description || chat?.description || `Rejoins les téléspectateurs et discute de ${display} en temps réel sur LiveWave. Sans compte, gratuit.`;
  const image = event?.og || ogImageUrl({ title: display, subtitle: "Chat en direct" });
  const url = `${SITE}/chat/${encodeURIComponent(name)}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url,
      image,
      isPartOf: { "@type": "WebSite", name: "LiveWave", url: SITE },
    },
  ];
  if (event?.datestart) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": event.kind === "match" ? "SportsEvent" : "BroadcastEvent",
      name: display,
      description,
      startDate: event.datestart,
      endDate: event.dateend || undefined,
      image,
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: { "@type": "VirtualLocation", url },
      ...(event.kind === "match" && event.team_a
        ? { competitor: [event.team_a, event.team_b].map((n) => ({ "@type": "SportsTeam", name: n })) }
        : {}),
      ...(event.channel ? { publisher: { "@type": "Organization", name: event.channel } } : {}),
      organizer: { "@type": "Organization", name: "LiveWave", url: SITE },
      isAccessibleForFree: true,
    });
  }

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="LiveWave" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="fr_FR" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@LiveWaveChat" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>
</head>
<body>
<h1>${esc(display)} : le chat en direct</h1>
<p>${esc(description)}</p>
${event?.channel ? `<p>Diffusion : ${esc(event.channel)}</p>` : ""}
<p><a href="${esc(url)}">Rejoindre la discussion en direct sur LiveWave</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=600" },
  });
}
