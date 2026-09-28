import { TwitterApi } from "twitter-api-v2";
import { BskyAgent, RichText } from "@atproto/api";
import sharp from "sharp";

let xClient;
export function getX() {
  if (xClient !== undefined) return xClient;
  const sfx = process.env.TWITTER_API_KEY_2 ? "_2" : "";
  const appKey = process.env[`TWITTER_API_KEY${sfx}`];
  xClient = appKey
    ? new TwitterApi({
        appKey,
        appSecret: process.env[`TWITTER_API_SECRET${sfx}`],
        accessToken: process.env[`TWITTER_ACCESS_TOKEN${sfx}`],
        accessSecret: process.env[`TWITTER_ACCESS_SECRET${sfx}`],
      })
    : null;
  return xClient;
}

export async function postX(text) {
  const client = getX();
  if (!client) throw new Error("identifiants X absents");
  const res = await client.v2.tweet({ text });
  return res.data.id;
}

let bsky;
async function getBsky() {
  if (bsky) return bsky;
  if (!process.env.BSKY_PASSWORD || !process.env.BSKY_IDENTIFIER) return null;
  const agent = new BskyAgent({ service: "https://bsky.social" });
  await agent.login({ identifier: process.env.BSKY_IDENTIFIER, password: process.env.BSKY_PASSWORD });
  bsky = agent;
  return agent;
}

export const hasBsky = () => !!(process.env.BSKY_PASSWORD && process.env.BSKY_IDENTIFIER);

// Bluesky ne lit pas les balises OG : on joint la carte nous-memes
export async function postBsky(text, { url, title, description, image }) {
  const agent = await getBsky();
  if (!agent) throw new Error("identifiants Bluesky absents");
  const rt = new RichText({ text: [...text].length > 300 ? `${[...text].slice(0, 297).join("")}...` : text });
  await rt.detectFacets(agent);

  let thumb;
  if (image) {
    const res = await fetch(image);
    if (res.ok) {
      const jpeg = await sharp(Buffer.from(await res.arrayBuffer())).resize({ width: 1200 }).jpeg({ quality: 82 }).toBuffer();
      thumb = (await agent.uploadBlob(jpeg, { encoding: "image/jpeg" })).data.blob;
    }
  }

  const res = await agent.post({
    text: rt.text,
    facets: rt.facets,
    embed: { $type: "app.bsky.embed.external", external: { uri: url, title, description, ...(thumb ? { thumb } : {}) } },
  });
  return res.uri;
}
