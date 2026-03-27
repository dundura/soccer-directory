/**
 * RSS News Fetcher for soccer news feeds.
 * Fetches from multiple sources, caches for 15 minutes, and returns top 10 articles.
 */

export interface NewsArticle {
  title: string;
  link: string;
  description: string;
  source: string;
  publishedAt: Date;
  imageUrl: string | null;
}

const RSS_FEEDS = [
  { url: "https://www.espn.com/espn/rss/soccer/news", source: "ESPN" },
  { url: "http://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC" },
  { url: "https://www.theguardian.com/football/rss", source: "The Guardian" },
  { url: "https://www.mlssoccer.com/rss/", source: "MLS" },
];

/* ── In-memory cache ────────────────────────────────────────── */

let cachedArticles: NewsArticle[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/* ── XML helpers (no dependency) ────────────────────────────── */

/** Extract text content between XML tags */
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

/** Extract attribute value from a self-closing or open tag */
function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*?${attr}=["']([^"']*)["']`);
  const match = xml.match(regex);
  return match ? match[1] : "";
}

/** Extract image URL from an RSS item block */
function extractImage(itemXml: string): string | null {
  // Try <enclosure> with image type
  const encUrl = extractAttr(itemXml, "enclosure", "url");
  if (encUrl && /\.(jpg|jpeg|png|gif|webp)/i.test(encUrl)) return encUrl;
  // If enclosure has type="image/*"
  const encType = extractAttr(itemXml, "enclosure", "type");
  if (encUrl && encType.startsWith("image/")) return encUrl;

  // Try <media:content> or <media:thumbnail>
  const mediaUrl =
    extractAttr(itemXml, "media:content", "url") ||
    extractAttr(itemXml, "media:thumbnail", "url");
  if (mediaUrl) return mediaUrl;

  // Try <image> inside item (some feeds)
  const imgInTag = extractTag(itemXml, "image");
  if (imgInTag && imgInTag.startsWith("http")) return imgInTag;

  // Try to find an <img> src in description HTML
  const imgSrcMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgSrcMatch) return imgSrcMatch[1];

  return null;
}

/** Split RSS XML into individual <item> blocks */
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
      headers: { "User-Agent": "SoccerNearMe/1.0" },
      next: { revalidate: 0 },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const items = extractItems(xml);

    return items.map((itemXml) => {
      const title = extractTag(itemXml, "title");
      const link = extractTag(itemXml, "link");
      const rawDesc = extractTag(itemXml, "description");
      // Strip HTML tags from description
      const cleanDesc = rawDesc.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
      const description = cleanDesc.length > 120 ? cleanDesc.slice(0, 117) + "..." : cleanDesc;
      const pubDate = extractTag(itemXml, "pubDate");
      const imageUrl = extractImage(itemXml);

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

export async function getNewsArticles(): Promise<NewsArticle[]> {
  // Return cached results if still valid
  if (cachedArticles.length > 0 && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedArticles;
  }

  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map((feed) => fetchFeed(feed.url, feed.source))
    );

    const allArticles: NewsArticle[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allArticles.push(...result.value);
      }
    }

    // Sort by date descending
    allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    // Deduplicate by title (case-insensitive)
    const seen = new Set<string>();
    const unique: NewsArticle[] = [];
    for (const article of allArticles) {
      const key = article.title.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(article);
      }
    }

    // Cache top 10
    cachedArticles = unique.slice(0, 10);
    cacheTimestamp = Date.now();
    return cachedArticles;
  } catch {
    return [];
  }
}
