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
  { table: "futsal_teams", urlPath: "futsal", label: "Futsal Team" },
  { table: "guest_opportunities", urlPath: "guest-play", label: "Guest Play" },
  { table: "recruiters", urlPath: "college-recruiting", label: "College Recruiting" },
  { table: "fundraisers", urlPath: "fundraiser", label: "Fundraiser" },
];

function buildEmail(
  picks: { label: string; name: string; url: string; city: string | null; state: string | null }[]
): string {
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const rows = picks.map(({ label, name, url, city, state }) => {
    const location = [city, state].filter(Boolean).join(", ");
    return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #e5e7eb;vertical-align:top;">
          <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">${label}</p>
          <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1a365d;">${name}</p>
          ${location ? `<p style="margin:0 0 8px;font-size:13px;color:#6b7280;">📍 ${location}</p>` : ""}
          <a href="${url}" style="display:inline-block;padding:8px 20px;background:#DC373E;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;font-size:13px;">View &amp; Share →</a>
        </td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:24px 16px;">
    <div style="background:#1a365d;border-radius:16px 16px 0 0;padding:28px 28px;text-align:center;">
      <h1 style="color:#ffffff;font-size:22px;margin:0 0 6px;">📣 ${day} Facebook Share List</h1>
      <p style="color:#94a3c4;font-size:14px;margin:0;">One listing per type — share each one in your Facebook groups today</p>
    </div>
    <div style="background:#ffffff;padding:28px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 20px;">Hey Neil — here are today's picks, one from each listing type:</p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>
    <div style="background:#f9fafb;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;padding:18px 28px;text-align:center;">
      <a href="https://www.soccer-near-me.com" style="color:#DC373E;font-size:13px;text-decoration:none;font-weight:600;">www.soccer-near-me.com</a>
    </div>
  </div>
</body>
</html>`;
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

  const picks: { label: string; name: string; url: string; city: string | null; state: string | null }[] = [];

  for (const { table, urlPath, label } of LISTING_TABLES) {
    try {
      // Get the last sent listing for this type to avoid repeating it
      const lastRows = await sql`
        SELECT listing_id FROM neil_fb_reminders
        WHERE listing_table = ${table}
        ORDER BY sent_at DESC LIMIT 1
      `;
      const lastId = (lastRows[0] as { listing_id: string } | undefined)?.listing_id;

      const query = lastId
        ? `SELECT id::text as id, name, slug, city, state FROM ${table} WHERE status = 'approved' AND slug IS NOT NULL AND id::text != '${lastId}' ORDER BY RANDOM() LIMIT 1`
        : `SELECT id::text as id, name, slug, city, state FROM ${table} WHERE status = 'approved' AND slug IS NOT NULL ORDER BY RANDOM() LIMIT 1`;

      const raw = [query] as unknown as TemplateStringsArray;
      const rows = await sql(raw);
      if (!rows[0]) continue;

      const row = rows[0] as { id: string; name: string; slug: string; city: string | null; state: string | null };
      const url = `https://www.soccer-near-me.com/${urlPath}/${row.slug}`;
      picks.push({ label, name: row.name, url, city: row.city ?? null, state: row.state ?? null });

      await sql`INSERT INTO neil_fb_reminders (listing_table, listing_id, listing_name) VALUES (${table}, ${row.id}, ${row.name})`;
    } catch {
      // Table may not have all columns — skip silently
    }
  }

  if (picks.length === 0) {
    return NextResponse.json({ error: "No listings found" }, { status: 404 });
  }

  await resend.emails.send({
    from: "Soccer Near Me <notifications@soccer-near-me.com>",
    to: "neil@anytime-soccer.com",
    subject: `📣 Facebook Share List — ${picks.length} Listings for Today`,
    html: buildEmail(picks),
  });

  return NextResponse.json({ success: true, count: picks.length, listings: picks.map((p) => p.name) });
}
