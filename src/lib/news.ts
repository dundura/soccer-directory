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

const RSS_FEEDS = [
  { url: "https://www.soccerwire.com/feed/", source: "SoccerWire", fallbackImg: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp" },
  { url: "https://www.topdrawersoccer.com/feeds/club.xml", source: "TopDrawerSoccer", fallbackImg: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg" },
  { url: "https://www.ussoccer.com/rss", source: "US Soccer", fallbackImg: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecnl_girls.jpg" },
  { url: "https://www.mlssoccer.com/rss/", source: "MLS", fallbackImg: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/futsal-scaled.jpg" },
  { url: "https://www.espn.com/espn/rss/soccer/news", source: "ESPN", fallbackImg: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp" },
  { url: "http://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC", fallbackImg: "https://media.anytime-soccer.com/wp-content/uploads/2026/01/idf.webp" },
];

/* ── In-memory cache ────────────────────────────────────────── */

let cachedArticles: NewsArticle[] = [];
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

  // <media:content> or <media:thumbnail>
  for (const tag of ["media:content", "media:thumbnail", "media\\:content", "media\\:thumbnail"]) {
    const url = extractAttr(itemXml, tag, "url");
    if (url) return url;
  }

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

async function fetchFeed(feedUrl: string, source: string, fallbackImg: string): Promise<NewsArticle[]> {
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
      const imageUrl = extractImage(itemXml) || fallbackImg;

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
  if (cachedArticles.length > 0 && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedArticles;
  }

  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map((feed) => fetchFeed(feed.url, feed.source, feed.fallbackImg))
    );

    const allArticles: NewsArticle[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allArticles.push(...result.value);
      }
    }

    // Sort by date descending
    allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    // Deduplicate by title
    const seen = new Set<string>();
    const unique: NewsArticle[] = [];
    for (const article of allArticles) {
      const key = article.title.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(article);
      }
    }

    cachedArticles = unique.slice(0, 12);
    cacheTimestamp = Date.now();
    return cachedArticles;
  } catch {
    return [];
  }
}
