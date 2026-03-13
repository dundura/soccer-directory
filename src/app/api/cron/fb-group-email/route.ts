import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY!);
const NOTIFY_EMAIL = "neil@anytime-soccer.com";

// All listing tables we want to send the Facebook group email for
const LISTING_TABLES: { table: string; nameCol: string; type: string }[] = [
  { table: "clubs", nameCol: "name", type: "club" },
  { table: "teams", nameCol: "name", type: "team" },
  { table: "tryouts", nameCol: "name", type: "tryout" },
  { table: "camps", nameCol: "name", type: "camp" },
  { table: "tournaments", nameCol: "name", type: "tournament" },
  { table: "special_events", nameCol: "name", type: "special event" },
  { table: "trainers", nameCol: "name", type: "trainer" },
  { table: "services", nameCol: "name", type: "service" },
  { table: "training_apps", nameCol: "name", type: "training app" },
  { table: "futsal_teams", nameCol: "name", type: "futsal team" },
  { table: "guest_opportunities", nameCol: "name", type: "guest play opportunity" },
  { table: "recruiters", nameCol: "name", type: "college recruiting advisor" },
  { table: "podcasts", nameCol: "name", type: "podcast" },
  { table: "blogs", nameCol: "name", type: "blog" },
  { table: "youtube_channels", nameCol: "name", type: "YouTube channel" },
  { table: "facebook_groups", nameCol: "name", type: "Facebook group" },
  { table: "instagram_pages", nameCol: "name", type: "Instagram page" },
  { table: "tiktok_pages", nameCol: "name", type: "TikTok page" },
  { table: "marketplace", nameCol: "name", type: "product" },
  { table: "international_trips", nameCol: "name", type: "international trip" },
  { table: "fundraisers", nameCol: "name", type: "fundraiser" },
];

function buildEmail(listingName: string, listingType: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">

    <!-- Header -->
    <div style="background: #1a365d; border-radius: 16px 16px 0 0; padding: 32px 28px; text-align: center;">
      <img src="https://www.soccer-near-me.com/logo.png" alt="Soccer Near Me" width="56" height="56" style="border-radius: 50%; margin-bottom: 12px;" />
      <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 6px;">Get More Eyes on Your Listing</h1>
      <p style="color: #94a3c4; font-size: 14px; margin: 0;">Share your ${listingType} with thousands of soccer families</p>
    </div>

    <!-- Body -->
    <div style="background: #ffffff; padding: 32px 28px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">

      <p style="color: #333; font-size: 15px; line-height: 1.7; margin: 0 0 18px;">
        Hi there,
      </p>

      <p style="color: #333; font-size: 15px; line-height: 1.7; margin: 0 0 18px;">
        Thank you for listing <strong>${listingName}</strong> on Soccer Near Me! We appreciate you being part of our growing community.
      </p>

      <p style="color: #333; font-size: 15px; line-height: 1.7; margin: 0 0 18px;">
        Did you know you can <strong>reach even more families</strong> by sharing your listing in our Facebook groups? We have several active groups where parents, coaches, and players are constantly looking for opportunities like yours.
      </p>

      <!-- Facebook Groups -->
      <div style="background: #f0f4ff; border-radius: 12px; padding: 20px 24px; margin: 24px 0;">
        <p style="color: #1a365d; font-size: 14px; font-weight: 700; margin: 0 0 14px; text-transform: uppercase; letter-spacing: 0.5px;">Our Facebook Groups</p>

        <div style="margin-bottom: 10px;">
          <a href="https://www.soccer-near-me.com/facebook-groups/anytime-soccer-parents-coaches-players" style="color: #DC373E; font-size: 14px; font-weight: 600; text-decoration: none;">Anytime Soccer Parents, Coaches &amp; Players</a>
        </div>
        <div style="margin-bottom: 10px;">
          <a href="https://www.soccer-near-me.com/facebook-groups/youth-soccer-coach" style="color: #DC373E; font-size: 14px; font-weight: 600; text-decoration: none;">Youth Soccer Coach</a>
        </div>
        <div>
          <a href="https://www.soccer-near-me.com/facebook-groups/youth-soccer-guest-player-group" style="color: #DC373E; font-size: 14px; font-weight: 600; text-decoration: none;">Youth Soccer Guest Player Group</a>
        </div>
      </div>

      <!-- How it works -->
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px 24px; margin: 24px 0;">
        <p style="color: #92400E; font-size: 14px; font-weight: 700; margin: 0 0 10px;">How It Works</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 12px 6px 0; vertical-align: top; color: #b45309; font-weight: bold; font-size: 20px; width: 36px;">1.</td>
            <td style="padding: 6px 0; color: #78350f; font-size: 14px; line-height: 1.5;">Join any of the groups above</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px 6px 0; vertical-align: top; color: #b45309; font-weight: bold; font-size: 20px;">2.</td>
            <td style="padding: 6px 0; color: #78350f; font-size: 14px; line-height: 1.5;">Share your listing link with a short description of what you offer</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px 6px 0; vertical-align: top; color: #b45309; font-weight: bold; font-size: 20px;">3.</td>
            <td style="padding: 6px 0; color: #78350f; font-size: 14px; line-height: 1.5;">We review and approve one post per day to keep the feed high quality</td>
          </tr>
        </table>
      </div>

      <p style="color: #333; font-size: 15px; line-height: 1.7; margin: 0 0 18px;">
        <strong>Quick tip:</strong> Make sure your listing has great photos! Listings with high-quality images get significantly more views and engagement. Take a moment to update your photos if needed — it makes a big difference.
      </p>

      <p style="color: #333; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
        It's a great (and free!) way to get your ${listingType} in front of the right audience. Share your listing today!
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://www.soccer-near-me.com" style="display: inline-block; padding: 14px 36px; background: #DC373E; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px;">Visit Soccer Near Me</a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none; padding: 24px 28px; text-align: center;">
      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
        Thank you for being part of the Soccer Near Me community!
      </p>
      <a href="https://www.soccer-near-me.com" style="color: #DC373E; font-size: 13px; text-decoration: none; font-weight: 600;">www.soccer-near-me.com</a>
    </div>

  </div>
</body>
</html>
`;
}

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let totalSent = 0;
  const errors: string[] = [];

  for (const { table, nameCol, type } of LISTING_TABLES) {
    try {
      // Find listings created ~3 days ago that we haven't emailed yet
      // Window: between 3 and 4 days ago (so the daily cron catches them once)
      const query = `
        SELECT l.id::text, l.${nameCol} as listing_name, u.email as user_email
        FROM ${table} l
        JOIN users u ON u.id = l.user_id
        WHERE l.created_at >= NOW() - INTERVAL '4 days'
          AND l.created_at < NOW() - INTERVAL '3 days'
          AND NOT EXISTS (
            SELECT 1 FROM fb_group_emails_sent s
            WHERE s.listing_table = '${table}' AND s.listing_id = l.id::text
          )
          AND u.email IS NOT NULL
          AND u.email != ''
      `;
      const raw = [query] as unknown as TemplateStringsArray;
      const listings = await sql(raw);

      for (const listing of listings) {
        try {
          await resend.emails.send({
            from: "Soccer Near Me <notifications@soccer-near-me.com>",
            to: listing.user_email,
            bcc: NOTIFY_EMAIL,
            subject: "Share Your Listing With Thousands of Soccer Families",
            html: buildEmail(listing.listing_name || "your listing", type),
          });

          // Record that we sent this email
          await sql`INSERT INTO fb_group_emails_sent (listing_table, listing_id, user_email) VALUES (${table}, ${listing.id}, ${listing.user_email}) ON CONFLICT DO NOTHING`;

          totalSent++;
        } catch (err) {
          errors.push(`Failed to email ${listing.user_email} for ${table}/${listing.id}: ${err}`);
        }
      }
    } catch (err) {
      errors.push(`Failed to query ${table}: ${err}`);
    }
  }

  return NextResponse.json({
    success: true,
    emailsSent: totalSent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
