import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY!);

const LISTING_TABLES: { table: string; urlPath: string; label: string }[] = [
  { table: "clubs", urlPath: "clubs", label: "Club" },
  { table: "teams", urlPath: "teams", label: "Team" },
  { table: "tryouts", urlPath: "tryouts", label: "Tryout" },
  { table: "camps", urlPath: "camps", label: "Camp" },
  { table: "tournaments", urlPath: "tournaments", label: "Tournament" },
  { table: "special_events", urlPath: "special-events", label: "Special Event" },
  { table: "trainers", urlPath: "trainers", label: "Trainer" },
  { table: "services", urlPath: "services", label: "Service" },
  { table: "training_apps", urlPath: "training-apps", label: "Training App" },
  { table: "futsal_teams", urlPath: "futsal-teams", label: "Futsal Team" },
  { table: "guest_opportunities", urlPath: "guest-play", label: "Guest Play Opportunity" },
  { table: "recruiters", urlPath: "recruiters", label: "Recruiter" },
  { table: "podcasts", urlPath: "podcasts", label: "Podcast" },
  { table: "blogs", urlPath: "blog", label: "Blog" },
  { table: "youtube_channels", urlPath: "youtube-channels", label: "YouTube Channel" },
  { table: "facebook_groups", urlPath: "facebook-groups", label: "Facebook Group" },
  { table: "instagram_pages", urlPath: "instagram-pages", label: "Instagram Page" },
  { table: "tiktok_pages", urlPath: "tiktok-pages", label: "TikTok Page" },
  { table: "marketplace", urlPath: "marketplace", label: "Marketplace Listing" },
  { table: "international_trips", urlPath: "international-trips", label: "International Trip" },
  { table: "fundraisers", urlPath: "fundraisers", label: "Fundraiser" },
];

function buildEmail(name: string, label: string, url: string, city: string | null, state: string | null): string {
  const location = [city, state].filter(Boolean).join(", ");
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="background:#1a365d;border-radius:16px 16px 0 0;padding:32px 28px;text-align:center;">
      <h1 style="color:#ffffff;font-size:22px;margin:0 0 6px;">📣 ${day} Facebook Share Reminder</h1>
      <p style="color:#94a3c4;font-size:14px;margin:0;">Share this listing with your Facebook groups today</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">

      <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Hey Neil — here's a listing to share with your Facebook groups today:
      </p>

      <!-- Listing Card -->
      <div style="background:#f0f4ff;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
        <p style="color:#94a3c4;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">${label}</p>
        <h2 style="color:#1a365d;font-size:20px;font-weight:800;margin:0 0 6px;">${name}</h2>
        ${location ? `<p style="color:#6b7280;font-size:14px;margin:0 0 16px;">📍 ${location}</p>` : ''}
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:#DC373E;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">View Listing →</a>
      </div>

      <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 12px;">
        Post this in your Facebook groups — copy the link above and drop it with a short note like:
      </p>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
        <p style="color:#78350f;font-size:14px;line-height:1.6;margin:0;font-style:italic;">
          "Check out <strong>${name}</strong> on Soccer Near Me — ${label.toLowerCase()} worth knowing about! ${url}"
        </p>
      </div>

      <p style="color:#6b7280;font-size:13px;margin:0;">
        You'll get a new listing reminder every Monday and Saturday. No two reminders will feature the same listing back-to-back.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;padding:20px 28px;text-align:center;">
      <a href="https://www.soccer-near-me.com" style="color:#DC373E;font-size:13px;text-decoration:none;font-weight:600;">www.soccer-near-me.com</a>
    </div>

  </div>
</body>
</html>
`;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure tracking table exists
  await sql`
    CREATE TABLE IF NOT EXISTS neil_fb_reminders (
      id SERIAL PRIMARY KEY,
      listing_table TEXT NOT NULL,
      listing_id TEXT NOT NULL,
      listing_name TEXT,
      sent_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Get the last sent listing to avoid repeating it
  const lastRows = await sql`SELECT listing_table, listing_id FROM neil_fb_reminders ORDER BY sent_at DESC LIMIT 1`;
  const last = lastRows[0] as { listing_table: string; listing_id: string } | undefined;

  // Gather all approved listings across all tables
  const allListings: { table: string; urlPath: string; label: string; id: string; name: string; slug: string; city: string | null; state: string | null }[] = [];

  for (const { table, urlPath, label } of LISTING_TABLES) {
    try {
      const query = `SELECT id::text as id, name, slug, city, state FROM ${table} WHERE status = 'approved' AND slug IS NOT NULL`;
      const raw = [query] as unknown as TemplateStringsArray;
      const rows = await sql(raw);
      for (const row of rows) {
        allListings.push({ table, urlPath, label, id: row.id, name: row.name, slug: row.slug, city: row.city ?? null, state: row.state ?? null });
      }
    } catch {
      // Table may not have all columns — skip silently
    }
  }

  if (allListings.length === 0) {
    return NextResponse.json({ error: "No listings found" }, { status: 404 });
  }

  // Filter out last sent listing
  const candidates = last
    ? allListings.filter((l) => !(l.table === last.listing_table && l.id === last.listing_id))
    : allListings;

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const url = `https://www.soccer-near-me.com/${pick.urlPath}/${pick.slug}`;

  await resend.emails.send({
    from: "Soccer Near Me <notifications@soccer-near-me.com>",
    to: "neil@anytime-soccer.com",
    subject: `📣 Share This on Facebook Today: ${pick.name}`,
    html: buildEmail(pick.name, pick.label, url, pick.city, pick.state),
  });

  await sql`INSERT INTO neil_fb_reminders (listing_table, listing_id, listing_name) VALUES (${pick.table}, ${pick.id}, ${pick.name})`;

  return NextResponse.json({ success: true, listing: pick.name, url });
}
