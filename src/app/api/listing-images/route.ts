import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const TYPE_TO_TABLE: Record<string, string> = {
  club: "clubs", team: "teams", trainer: "trainers", recruiter: "recruiters", camp: "camps",
  guest: "guest_opportunities", tournament: "tournaments", futsal: "futsal_teams",
  trip: "international_trips", marketplace: "marketplace", player: "player_profiles",
  podcast: "podcasts", fbgroup: "facebook_groups", instagrampage: "instagram_pages", tiktokpage: "tiktok_pages", service: "services",
  tryout: "tryouts", specialevent: "special_events", trainingapp: "training_apps", blog: "blogs", youtube: "youtube_channels",
  scrimmage: "scrimmages",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";
  const id = searchParams.get("id") || "";

  const table = TYPE_TO_TABLE[type];
  if (!table || !id) {
    return NextResponse.json([]);
  }

  try {
    const raw = [`SELECT photos, team_photo, image_url, logo FROM ${table} WHERE id = `, " LIMIT 1"] as unknown as TemplateStringsArray;
    const rows: Record<string, unknown>[] = await sql(raw, id);
    if (!rows[0]) return NextResponse.json([]);

    const images: string[] = [];
    const row = rows[0];

    // Parse photos JSON array
    if (row.photos) {
      try {
        const parsed = JSON.parse(row.photos as string);
        if (Array.isArray(parsed)) {
          for (const url of parsed) {
            if (typeof url === "string" && url.trim()) images.push(url.trim());
          }
        }
      } catch { /* ignore */ }
    }

    // Add other image fields
    if (row.team_photo && typeof row.team_photo === "string") images.push(row.team_photo);
    if (row.image_url && typeof row.image_url === "string" && !images.includes(row.image_url)) images.push(row.image_url);
    if (row.logo && typeof row.logo === "string" && !images.includes(row.logo)) images.push(row.logo);

    return NextResponse.json(images);
  } catch {
    return NextResponse.json([]);
  }
}
