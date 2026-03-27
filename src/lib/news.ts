/**
 * RSS News Fetcher for soccer news feeds (youth soccer focus).
 * Fetches from multiple sources, caches for 15 minutes, returns top 12 articles.
 */

export interface NewsArticle {
  title: string;
  link: string;
  description: string;
  source: string;
  publishedAt: Date;
  imageUrl: string;
}

const FALLBACK_IMAGES = [
  "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp",
  "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg",
  "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecnl_girls.jpg",
  "https://media.anytime-soccer.com/wp-content/uploads/2026/02/futsal-scaled.jpg",
  "https://media.anytime-soccer.com/wp-content/uploads/2026/01/idf.webp",
];

function randomFallbackImage(): string {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
}

const CAROUSEL_FEEDS = [
  { url: "https://www.espn.com/espn/rss/soccer/news", source: "ESPN" },
  { url: "http://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC" },
  { url: "https://www.fourfourtwo.com/feeds/all", source: "FourFourTwo" },
  { url: "https://www.90min.com/posts.rss", source: "90min" },
];

const LINK_FEEDS = [
  { url: "https://sports.yahoo.com/soccer/rss", source: "Yahoo Sports" },
  { url: "https://www.theguardian.com/football/rss", source: "The Guardian" },
];

/* ── In-memory cache ────────────────────────────────────────── */

let cachedCarousel: NewsArticle[] = [];
let cachedLinks: NewsArticle[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/* ── XML helpers (no dependency) ────────────────────────────── */

function extractTag(xml: string, tag: string): string {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`);
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  // Normal tag
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*?${attr}\\s*=\\s*["']([^"']*)["']`, "i");
  const match = xml.match(regex);
  return match ? match[1] : "";
}

function extractImage(itemXml: string): string | null {
  // <enclosure> with image type or image extension
  const encUrl = extractAttr(itemXml, "enclosure", "url");
  if (encUrl && (/\.(jpg|jpeg|png|gif|webp)/i.test(encUrl) || itemXml.includes('type="image'))) return encUrl;

  // <media:content> or <media:thumbnail> — handle namespace colon
  const mediaContentMatch = itemXml.match(/media:content[^>]*url\s*=\s*["']([^"']+)["']/i);
  if (mediaContentMatch && mediaContentMatch[1].startsWith("http")) return mediaContentMatch[1];
  const mediaThumbnailMatch = itemXml.match(/media:thumbnail[^>]*url\s*=\s*["']([^"']+)["']/i);
  if (mediaThumbnailMatch && mediaThumbnailMatch[1].startsWith("http")) return mediaThumbnailMatch[1];

  // <image><url>...</url></image>
  const imageBlock = extractTag(itemXml, "image");
  if (imageBlock) {
    const imgUrl = extractTag(imageBlock, "url");
    if (imgUrl && imgUrl.startsWith("http")) return imgUrl;
    if (imageBlock.startsWith("http")) return imageBlock;
  }

  // <img src="..."> in description or content
  const imgSrcMatch = itemXml.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
  if (imgSrcMatch && imgSrcMatch[1].startsWith("http")) return imgSrcMatch[1];

  // content:encoded may have images
  const contentEncoded = extractTag(itemXml, "content:encoded") || extractTag(itemXml, "content\\:encoded");
  if (contentEncoded) {
    const contentImgMatch = contentEncoded.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
    if (contentImgMatch && contentImgMatch[1].startsWith("http")) return contentImgMatch[1];
  }

  return null;
}

function extractItems(xml: string): string[] {
  const items: string[] = [];
  const regex = /<item[\s>]([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    items.push(match[1]);
  }
  return items;
}

/* ── Fetch a single feed ────────────────────────────────────── */

async function fetchFeed(feedUrl: string, source: string): Promise<NewsArticle[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SoccerNearMe/1.0)" },
      next: { revalidate: 0 },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const items = extractItems(xml);

    return items.slice(0, 5).map((itemXml) => {
      const title = extractTag(itemXml, "title");
      const link = extractTag(itemXml, "link") || extractAttr(itemXml, "link", "href");
      const rawDesc = extractTag(itemXml, "description");
      const cleanDesc = rawDesc.replace(/<[^>]*>/g, "").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
      const description = cleanDesc.length > 120 ? cleanDesc.slice(0, 117) + "..." : cleanDesc;
      const pubDate = extractTag(itemXml, "pubDate") || extractTag(itemXml, "dc:date") || extractTag(itemXml, "dc\\:date");
      const imageUrl = extractImage(itemXml) || randomFallbackImage();

      return {
        title,
        link,
        description,
        source,
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
        imageUrl,
      };
    }).filter((a) => a.title && a.link);
  } catch {
    return [];
  }
}

/* ── Public API ─────────────────────────────────────────────── */

function dedupeAndInterleave(articles: NewsArticle[], max: number): NewsArticle[] {
  const seen = new Set<string>();
  const unique: NewsArticle[] = [];
  for (const a of articles) {
    const key = a.title.toLowerCase().trim();
    if (!seen.has(key)) { seen.add(key); unique.push(a); }
  }
  const bySource: Record<string, NewsArticle[]> = {};
  for (const a of unique) {
    if (!bySource[a.source]) bySource[a.source] = [];
    bySource[a.source].push(a);
  }
  const interleaved: NewsArticle[] = [];
  const sources = Object.keys(bySource);
  let idx = 0;
  while (interleaved.length < max && sources.some(s => bySource[s].length > 0)) {
    const source = sources[idx % sources.length];
    if (bySource[source].length > 0) interleaved.push(bySource[source].shift()!);
    idx++;
  }
  return interleaved;
}

export async function getNewsArticles(): Promise<{ carousel: NewsArticle[]; links: NewsArticle[] }> {
  if ((cachedCarousel.length > 0 || cachedLinks.length > 0) && Date.now() - cacheTimestamp < CACHE_TTL) {
    return { carousel: cachedCarousel, links: cachedLinks };
  }

  try {
    const [carouselResults, linkResults] = await Promise.all([
      Promise.allSettled(CAROUSEL_FEEDS.map((f) => fetchFeed(f.url, f.source))),
      Promise.allSettled(LINK_FEEDS.map((f) => fetchFeed(f.url, f.source))),
    ]);

    const carouselAll: NewsArticle[] = [];
    for (const r of carouselResults) { if (r.status === "fulfilled") carouselAll.push(...r.value); }
    carouselAll.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    const linkAll: NewsArticle[] = [];
    for (const r of linkResults) { if (r.status === "fulfilled") linkAll.push(...r.value); }
    linkAll.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    cachedCarousel = dedupeAndInterleave(carouselAll, 12);
    // One article per source for links
    const linkSeen = new Set<string>();
    const linkOneEach: NewsArticle[] = [];
    for (const a of linkAll) {
      if (!linkSeen.has(a.source)) {
        linkSeen.add(a.source);
        linkOneEach.push(a);
      }
    }
    cachedLinks = linkOneEach;
    cacheTimestamp = Date.now();
    return { carousel: cachedCarousel, links: cachedLinks };
  } catch {
    return { carousel: [], links: [] };
  }
}
