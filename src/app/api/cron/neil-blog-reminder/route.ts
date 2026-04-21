import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY!);

// Blog posts from anytime-soccer.com (used on Wednesdays)
const AST_BLOG_SLUGS = [
  "best-soccer-coaching-apps-2025",
  "the-98-percent-principle-individual-training",
  "the-complete-u13-soccer-development-guide",
  "the-15-minute-daily-soccer-routine-i-used-to-train-my-sons-rec-to-academy",
  "soccer-development-milestones-by-age-what-your-child-should-know-at-every-stage",
  "most-least-expensive-us-cities-for-club-soccer-in-2026-cost-guide",
  "complete-mls-academy-rankings-mls-next-vs-ecnl-2026",
  "10-great-college-soccer-programs-youve-probably-never-heard-of",
  "top-10-questions-new-soccer-parents-are-afraid-to-ask",
  "complete-hbcu-soccer-guide-all-programs-by-region-2026",
  "complete-guide-to-college-soccer-id-camps-top-programs-for-boys-girls-by-region-2026",
  "the-complete-college-soccer-showcase-guide-top-10-for-boys-top-10-for-girls-by-region-2026",
  "complete-guide-to-u-s-youth-soccer-structure-2026",
  "the-college-soccer-recruiting-process-where-to-start-the-complete-2026-guide",
  "why-ball-mastery-is-the-foundation-of-every-great-player",
  "10-ball-mastery-drills-your-child-can-do-in-10-minutes",
  "how-to-train-your-child-in-soccer-even-if-you-never-played",
  "the-ultimate-guide-to-at-home-soccer-training",
  "what-age-should-my-child-start-soccer-training",
  "coaching-u14-drills-that-force-communication-on-the-field",
  "how-to-motivate-kids-to-train-at-home-and-make-it-fun-with-team-contests",
  "the-must-have-soccer-gear-checklist-for-every-parent-with-budget-friendly-options",
  "top-5-grip-socks-for-2025-do-they-really-make-a-difference",
  "the-ultimate-sideline-survival-kit-for-soccer-parents",
  "futsal-beginners-guide-the-ultimate-guide-to-futsal",
  "5-best-soccer-rebounders-for-players-and-coaches-in-2025",
  "the-top-5-benefits-of-soccer-for-kids-backed-by-science",
  "how-much-soccer-training-does-your-child-really-need-a-soccer-dads-guide-to-getting-better-without-burning-out",
  "5-things-every-soccer-coach-and-club-should-be-doing-to-develop-kids-beyond-the-field",
  "why-in-home-soccer-training-is-the-future-of-youth-development",
  "breaking-down-the-maze-of-youth-soccer-ecnl-ga-npl-mls-next-mls-next-pro",
  "college-soccer-id-camps-what-every-player-parent-should-know",
  "free-7-day-soccer-skills-challenge",
  "helping-your-child-grow-in-soccer-a-dads-perspective",
  "from-backyard-to-club-team-how-one-familys-home-training-journey-changed-everything-complete-guide-training-plan",
  "the-global-youth-soccer-cost-myth-what-you-actually-get-and-dont-get-when-government-funds-football",
];

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bUs\b/, "US")
    .replace(/\bU13\b/i, "U13")
    .replace(/\bU14\b/i, "U14")
    .replace(/\bEcnl\b/, "ECNL")
    .replace(/\bNpl\b/, "NPL")
    .replace(/\bMls\b/, "MLS")
    .replace(/\bHbcu\b/, "HBCU");
}

function buildEmail(title: string, url: string, site: "snm" | "ast"): string {
  const siteName = site === "snm" ? "Soccer Near Me" : "Anytime Soccer Training";
  const siteUrl = site === "snm" ? "https://www.soccer-near-me.com" : "https://www.anytime-soccer.com";
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const accentColor = site === "snm" ? "#DC373E" : "#0F3154";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#1a365d;border-radius:16px 16px 0 0;padding:28px 28px;text-align:center;">
      <h1 style="color:#ffffff;font-size:22px;margin:0 0 6px;">📝 ${day} Blog Share</h1>
      <p style="color:#94a3c4;font-size:14px;margin:0;">Share this blog post in your Facebook groups today</p>
    </div>
    <div style="background:#ffffff;padding:32px 28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 20px;">Hey Neil — here's today's blog post to share:</p>

      <div style="background:#f0f4ff;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
        <p style="color:#94a3c4;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">${siteName}</p>
        <h2 style="color:#1a365d;font-size:18px;font-weight:800;margin:0 0 16px;line-height:1.3;">${title}</h2>
        <a href="${url}" style="display:inline-block;padding:12px 28px;background:${accentColor};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Read &amp; Share →</a>
      </div>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
        <p style="color:#78350f;font-size:14px;line-height:1.6;margin:0;font-style:italic;">
          "Check out this article: <strong>${title}</strong> — ${url}"
        </p>
      </div>

      <p style="color:#6b7280;font-size:13px;margin:0;">Copy the link above and drop it in your Facebook groups with a short note!</p>
    </div>
    <div style="background:#f9fafb;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;padding:18px 28px;text-align:center;">
      <a href="${siteUrl}" style="color:${accentColor};font-size:13px;text-decoration:none;font-weight:600;">${siteUrl.replace("https://", "")}</a>
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
    CREATE TABLE IF NOT EXISTS neil_blog_reminders (
      id SERIAL PRIMARY KEY,
      source TEXT NOT NULL,
      slug TEXT NOT NULL,
      sent_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  const dayOfWeek = new Date().getUTCDay(); // 2 = Tuesday, 3 = Wednesday

  if (dayOfWeek === 2) {
    // Tuesday: soccer-near-me.com blog post
    const lastRows = await sql`SELECT slug FROM neil_blog_reminders WHERE source = 'snm' ORDER BY sent_at DESC LIMIT 1`;
    const lastSlug = (lastRows[0] as { slug: string } | undefined)?.slug;

    const query = lastSlug
      ? `SELECT slug, title FROM listing_posts WHERE hidden = false AND slug IS NOT NULL AND slug != '${lastSlug}' ORDER BY RANDOM() LIMIT 1`
      : `SELECT slug, title FROM listing_posts WHERE hidden = false AND slug IS NOT NULL ORDER BY RANDOM() LIMIT 1`;
    const raw = [query] as unknown as TemplateStringsArray;
    const rows = await sql(raw);

    if (!rows[0]) return NextResponse.json({ error: "No blog posts found" }, { status: 404 });
    const row = rows[0] as { slug: string; title: string };
    const url = `https://www.soccer-near-me.com/posts/${row.slug}`;
    const title = row.title || slugToTitle(row.slug);

    await resend.emails.send({
      from: "Soccer Near Me <notifications@soccer-near-me.com>",
      to: "neil@anytime-soccer.com",
      subject: `📝 Blog to Share Today: ${title}`,
      html: buildEmail(title, url, "snm"),
    });

    await sql`INSERT INTO neil_blog_reminders (source, slug) VALUES ('snm', ${row.slug})`;
    return NextResponse.json({ success: true, source: "snm", title, url });
  }

  if (dayOfWeek === 3) {
    // Wednesday: anytime-soccer.com blog post
    const lastRows = await sql`SELECT slug FROM neil_blog_reminders WHERE source = 'ast' ORDER BY sent_at DESC LIMIT 1`;
    const lastSlug = (lastRows[0] as { slug: string } | undefined)?.slug;

    const candidates = lastSlug ? AST_BLOG_SLUGS.filter((s) => s !== lastSlug) : AST_BLOG_SLUGS;
    const slug = candidates[Math.floor(Math.random() * candidates.length)];
    const url = `https://www.anytime-soccer.com/${slug}`;
    const title = slugToTitle(slug);

    await resend.emails.send({
      from: "Soccer Near Me <notifications@soccer-near-me.com>",
      to: "neil@anytime-soccer.com",
      subject: `📝 Blog to Share Today: ${title}`,
      html: buildEmail(title, url, "ast"),
    });

    await sql`INSERT INTO neil_blog_reminders (source, slug) VALUES ('ast', ${slug})`;
    return NextResponse.json({ success: true, source: "ast", title, url });
  }

  return NextResponse.json({ message: "Not a blog send day" });
}
