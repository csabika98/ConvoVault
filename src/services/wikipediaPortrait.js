export async function fetchWikipediaPortraitUrl(title) {
  const safeTitle = encodeURIComponent(String(title ?? "").trim());
  if (!safeTitle) return null;

  try {
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${safeTitle}`;
    const summaryResponse = await fetch(summaryUrl);
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      const fromSummary =
        summaryData?.thumbnail?.source || summaryData?.originalimage?.source;
      if (typeof fromSummary === "string" && fromSummary) return fromSummary;
    }

    const pageImageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=512&redirects=1&format=json&titles=${safeTitle}&origin=*`;
    const response = await fetch(pageImageUrl);
    if (!response.ok) return null;
    const data = await response.json();
    const pages = data?.query?.pages;
    if (!pages || typeof pages !== "object") return null;
    for (const page of Object.values(pages)) {
      const source = page?.thumbnail?.source;
      if (typeof source === "string" && source) return source;
    }
    return null;
  } catch {
    return null;
  }
}
