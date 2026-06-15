import { neon } from "@neondatabase/serverless";

const BASE = "https://www.soccer-near-me.com";

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^?&\s]+)/);
  return match ? match[1] : null;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Row = { slug: string; name: string; video_url: string };

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  const [clubs, teams, trainers, camps, apps] = await Promise.all([
    sql`SELECT slug, name, video_url FROM clubs WHERE status = 'approved' AND video_url IS NOT NULL AND video_url != ''`.catch(() => []),
    sql`SELECT slug, name, video_url FROM teams WHERE status = 'approved' AND video_url IS NOT NULL AND video_url != ''`.catch(() => []),
    sql`SELECT slug, name, video_url FROM trainers WHERE status = 'approved' AND video_url IS NOT NULL AND video_url != ''`.catch(() => []),
    sql`SELECT slug, name, video_url FROM camps WHERE status = 'approved' AND video_url IS NOT NULL AND video_url != ''`.catch(() => []),
    sql`SELECT slug, name, video_url FROM training_apps WHERE status = 'approved' AND video_url IS NOT NULL AND video_url != ''`.catch(() => []),
  ]);

  const entries: { pageUrl: string; videoId: string; title: string; description: string }[] = [];

  const add = (rows: unknown[], path: string, labelFn: (name: string) => [string, string]) => {
    for (const row of rows as Row[]) {
      const id = extractYouTubeId(row.video_url);
      if (!id) continue;
      const [title, description] = labelFn(row.name);
      entries.push({ pageUrl: `${BASE}/${path}/${row.slug}`, videoId: id, title, description });
    }
  };

  add(clubs, "clubs", (n) => [`${n} | Youth Soccer Club`, `Watch videos from ${n}, a youth soccer club listed on Soccer Near Me.`]);
  add(teams, "teams", (n) => [`${n} | Soccer Team`, `Watch videos from ${n}, a soccer team listed on Soccer Near Me.`]);
  add(trainers, "trainers", (n) => [`${n} | Soccer Trainer`, `Watch training videos from ${n}, a private soccer trainer on Soccer Near Me.`]);
  add(camps, "camps", (n) => [`${n} | Soccer Camp`, `Watch videos from ${n}, a soccer camp listed on Soccer Near Me.`]);
  add(apps, "training-apps", (n) => [`${n} | Soccer Training App`, `Watch demo videos for ${n}, a soccer training app listed on Soccer Near Me.`]);

  const urls = entries
    .map(({ pageUrl, videoId, title, description }) => `
  <url>
    <loc>${esc(pageUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>https://img.youtube.com/vi/${videoId}/maxresdefault.jpg</video:thumbnail_loc>
      <video:title>${esc(title)}</video:title>
      <video:description>${esc(description)}</video:description>
      <video:player_loc>https://www.youtube.com/embed/${videoId}</video:player_loc>
      <video:publication_date>2024-01-01T00:00:00+00:00</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=86400" },
  });
}
