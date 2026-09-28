const SITE = "https://www.livewave.fr";

async function rest(path) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  return res.ok ? res.json() : [];
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
const day = (d) => new Date(d || Date.now()).toISOString().slice(0, 10);

export async function GET() {
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [chats, events, posts] = await Promise.all([
    rest(`chats?select=title,created_at&created_at=gte.${since}&order=created_at.desc&limit=500`),
    rest(`events?select=name,updated_at,datestart&order=datestart.desc&limit=200`),
    rest(`blog?select=id,keyurl,date,created_at&order=created_at.desc&limit=200`),
  ]);

  const urls = new Map();
  const add = (loc, lastmod, changefreq, priority) => {
    if (!urls.has(loc)) urls.set(loc, { loc, lastmod, changefreq, priority });
  };

  add(`${SITE}/`, day(), "hourly", "1.0");
  add(`${SITE}/blogs`, day(posts[0]?.created_at), "weekly", "0.5");
  for (const e of events) add(`${SITE}/chat/${encodeURIComponent(e.name)}`, day(e.updated_at), "hourly", "0.9");
  for (const c of chats) add(`${SITE}/chat/${encodeURIComponent(c.title)}`, day(c.created_at), "daily", "0.6");
  for (const p of posts) add(`${SITE}/blog/${encodeURIComponent(p.keyurl || p.id)}`, day(p.date || p.created_at), "monthly", "0.5");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls.values()]
  .map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`)
  .join("\n")}
</urlset>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=900, s-maxage=3600" },
  });
}
