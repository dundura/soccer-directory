import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SoccerNearMeBot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();

    const title = extract(html, 'og:title') || extract(html, 'twitter:title') || extractTag(html, 'title');
    const description = extract(html, 'og:description') || extract(html, 'twitter:description') || extract(html, 'description');
    const image = extract(html, 'og:image') || extract(html, 'twitter:image');

    return NextResponse.json({ title: title?.slice(0, 200), description: description?.slice(0, 300), image });
  } catch {
    return NextResponse.json({ title: null, description: null, image: null });
  }
}

function extract(html: string, property: string): string | null {
  // Match quoted: property="og:title" content="value"
  const re1 = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
  const m1 = html.match(re1);
  if (m1) return decodeHtmlEntities(m1[1]);
  // Match quoted reverse order: content="value" property="og:title"
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, 'i');
  const m2 = html.match(re2);
  if (m2) return decodeHtmlEntities(m2[1]);
  // Match unquoted: property=og:title content=value or content="value with spaces"
  const re3 = new RegExp(`<meta[^>]*(?:property|name)=${property}[\\s>][^>]*content=(?:"([^"]*)"|([^\\s>]+))`, 'i');
  const m3 = html.match(re3);
  if (m3) return decodeHtmlEntities(m3[1] ?? m3[2]);
  // Match unquoted reverse: content=value property=og:title
  const re4 = new RegExp(`<meta[^>]*content=(?:"([^"]*)"|([^\\s>]+))[^>]*(?:property|name)=${property}[\\s>]`, 'i');
  const m4 = html.match(re4);
  if (m4) return decodeHtmlEntities(m4[1] ?? m4[2]);
  return null;
}

function decodeHtmlEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function extractTag(html: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
  const match = html.match(re);
  return match ? match[1].trim() : null;
}
