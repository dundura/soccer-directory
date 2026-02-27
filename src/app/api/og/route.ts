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
  const re = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
  const match = html.match(re);
  if (match) return match[1];
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, 'i');
  const match2 = html.match(re2);
  return match2 ? match2[1] : null;
}

function extractTag(html: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
  const match = html.match(re);
  return match ? match[1].trim() : null;
}
