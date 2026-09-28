import { renderCard, cardParamsFromQuery } from "./_lib/og-card.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  try {
    return await renderCard(cardParamsFromQuery(searchParams));
  } catch (e) {
    return new Response(`OG error: ${e.message}`, { status: 500 });
  }
}
