import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const DEFAULTS = [
  // Monday
  { day: "Monday", channel: "Social Media", task: "Post TikTok/Reel #1", details: "Player skill progression reel (Day 1 vs Day 30 format). Use trending audio. Caption: problem → solution → CTA to free trial", platforms: "TikTok + IG Reels", time_est: "45 min", sort_order: 1 },
  { day: "Monday", channel: "Email Marketing", task: "Prep weekly email", details: "Tuesday's email gets prepped Monday. Write subject line (A/B test), body copy, and CTA. Segment: active leads vs lapsed users", platforms: "Go High Level", time_est: "45 min", sort_order: 2 },
  { day: "Monday", channel: "Content / SEO", task: "Publish blog post", details: "1 SEO-optimized article per week. Alternate: comparison posts (DribbleUp vs Anytime), parent guides, training tips, coach resources", platforms: "Website Blog", time_est: "90 min", sort_order: 3 },
  { day: "Monday", channel: "Paid Ads", task: "Review weekend performance", details: "Check Meta & Google ROAS, CPC, CTR. Pause underperformers. Scale winners. Adjust budgets for the week", platforms: "Meta + Google Ads", time_est: "30 min", sort_order: 4 },
  // Tuesday
  { day: "Tuesday", channel: "Social Media", task: "Post TikTok/Reel #2", details: "Coach testimonial or parent reaction clip. Format: hook (3 sec) → story → result → CTA. Tag relevant soccer accounts", platforms: "TikTok + IG Reels", time_est: "45 min", sort_order: 5 },
  { day: "Tuesday", channel: "Email Marketing", task: "Send weekly broadcast", details: "Send the email prepped Monday. Target: 30%+ open rate, 3%+ CTR. Include 1 clear CTA (free trial, upgrade, or seasonal offer)", platforms: "Go High Level", time_est: "15 min", sort_order: 6 },
  { day: "Tuesday", channel: "Partnerships", task: "Coach/club outreach", details: "Send 5 personalized DMs or emails to coaches/club directors. Pitch Club Champion affiliate program or team platform demo", platforms: "Email + IG DM", time_est: "45 min", sort_order: 7 },
  // Wednesday
  { day: "Wednesday", channel: "Social Media", task: "Post TikTok/Reel #3", details: "Leaderboard spotlight — feature a top player. 'This week's #1 on the leaderboard trained 6 days straight 🔥'", platforms: "TikTok + IG Reels", time_est: "45 min", sort_order: 8 },
  { day: "Wednesday", channel: "Content / SEO", task: "Podcast episode work", details: "Record or edit The Inside Scoop episode. Guests: coaches, soccer parents, club directors, youth development experts", platforms: "Podcast platforms", time_est: "90 min", sort_order: 9 },
  { day: "Wednesday", channel: "Social Media", task: "Engage & comment", details: "30 min engaging: reply to comments, engage on soccer parent hashtags, comment on coach/club posts, share UGC to stories", platforms: "IG + TikTok + FB", time_est: "30 min", sort_order: 10 },
  // Thursday
  { day: "Thursday", channel: "Social Media", task: "Post TikTok/Reel #4", details: "Training tip / drill of the week. Quick 30-sec demo of a popular drill from the platform. 'Try this at home tonight 👇'", platforms: "TikTok + IG Reels", time_est: "45 min", sort_order: 11 },
  { day: "Thursday", channel: "Email Marketing", task: "Nurture sequence check", details: "Review automated email sequences: welcome series, trial-to-paid, re-engagement, coach onboarding. Optimize low-performers", platforms: "Go High Level", time_est: "30 min", sort_order: 12 },
  { day: "Thursday", channel: "Paid Ads", task: "Mid-week ad optimization", details: "A/B test new creative. Test new audiences. Review funnel: ad → landing page → signup → paid. Fix any drop-off points", platforms: "Meta + Google Ads", time_est: "45 min", sort_order: 13 },
  { day: "Thursday", channel: "Affiliate", task: "Ambassador check-in", details: "Message top 5 affiliates with performance update. Share new assets. Ask for content/testimonials they can post", platforms: "Email + Slack", time_est: "30 min", sort_order: 14 },
  // Friday
  { day: "Friday", channel: "Social Media", task: "Post TikTok/Reel #5", details: "Fun/viral format: soccer challenge, kid fails/wins compilation, 'POV: your kid after 30 days on Anytime Soccer'. Encourage shares", platforms: "TikTok + IG Reels", time_est: "45 min", sort_order: 15 },
  { day: "Friday", channel: "Content / SEO", task: "Publish podcast episode", details: "Upload and distribute The Inside Scoop. Write show notes with keywords. Share clips to social. Email subscribers", platforms: "Apple/Spotify + Site", time_est: "45 min", sort_order: 16 },
  { day: "Friday", channel: "Social Media", task: "Weekly analytics review", details: "Review weekly social metrics: follower growth, engagement rate, top-performing content, saves/shares. Document what worked", platforms: "All platforms", time_est: "30 min", sort_order: 17 },
  // Saturday
  { day: "Saturday", channel: "Social Media", task: "Weekend engagement post", details: "Story poll, Q&A, or 'What are you training this weekend?' engagement post. Repost any UGC from parents/players", platforms: "IG Stories + FB", time_est: "20 min", sort_order: 18 },
  { day: "Saturday", channel: "Content / SEO", task: "Next week content planning", details: "Plan next week's 5 videos (scripts, clips to repurpose). Draft blog topic. Prep email copy outline", platforms: "Planning doc", time_est: "45 min", sort_order: 19 },
  // Sunday
  { day: "Sunday", channel: "Social Media", task: "Light engagement / UGC repost", details: "Repost any tagged content from families training over the weekend. Simple motivational post: 'Rest day? Or get 1% better? 💪'", platforms: "IG + TikTok", time_est: "15 min", sort_order: 20 },
  { day: "Sunday", channel: "Email Marketing", task: "Prep Monday email", details: "Draft Monday's email if not done Saturday. Queue in Go High Level. Set A/B test for subject lines", platforms: "Go High Level", time_est: "30 min", sort_order: 21 },
];

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS focus_playbook (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      day TEXT NOT NULL,
      channel TEXT NOT NULL,
      task TEXT NOT NULL,
      details TEXT,
      platforms TEXT,
      time_est TEXT,
      done BOOLEAN DEFAULT FALSE,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

async function seedDefaults(email: string) {
  for (const d of DEFAULTS) {
    await sql`
      INSERT INTO focus_playbook (user_email, day, channel, task, details, platforms, time_est, sort_order)
      VALUES (${email}, ${d.day}, ${d.channel}, ${d.task}, ${d.details}, ${d.platforms}, ${d.time_est}, ${d.sort_order})
    `;
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTable();
    const rows = await sql`
      SELECT id, day, channel, task, details, platforms, time_est, done, sort_order
      FROM focus_playbook WHERE user_email = ${session.user.email}
      ORDER BY sort_order ASC
    `;
    if (rows.length === 0) {
      await seedDefaults(session.user.email);
      const seeded = await sql`
        SELECT id, day, channel, task, details, platforms, time_est, done, sort_order
        FROM focus_playbook WHERE user_email = ${session.user.email}
        ORDER BY sort_order ASC
      `;
      return NextResponse.json(seeded);
    }
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, done } = await req.json();
    await sql`UPDATE focus_playbook SET done = ${done} WHERE id = ${id} AND user_email = ${session.user.email}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Reset all done flags for a new week
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    if (searchParams.get("reset") === "week") {
      await sql`UPDATE focus_playbook SET done = FALSE WHERE user_email = ${session.user.email}`;
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
