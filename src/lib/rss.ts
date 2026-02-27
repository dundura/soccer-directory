export interface RssEpisode {
  title: string;
  description: string;
  url: string;
  pubDate: string;
  duration?: string;
}

function extractCDATA(text: string): string {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function getTagContent(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? extractCDATA(match[1]) : "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

export async function fetchRssEpisodes(feedUrl: string, limit = 10): Promise<RssEpisode[]> {
  try {
    const res = await fetch(feedUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: RssEpisode[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
      const itemXml = match[1];
      const title = getTagContent(itemXml, "title");
      const rawDesc = getTagContent(itemXml, "description") || getTagContent(itemXml, "itunes:summary");
      const description = stripHtml(rawDesc).slice(0, 200);
      const url = getTagContent(itemXml, "link");
      const pubDate = getTagContent(itemXml, "pubDate");
      const duration = getTagContent(itemXml, "itunes:duration");

      if (title && url) {
        items.push({ title, description, url, pubDate, duration });
      }
    }

    return items;
  } catch {
    return [];
  }
}
