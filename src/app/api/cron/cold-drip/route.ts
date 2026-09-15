import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import { getColdEmail, SENDER_NAME, SENDER_EMAIL, REPLY_TO, BCC } from "@/lib/cold-emails";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

// Cold email 1 ("Listing {club} on Soccer Near Me"), sent a few a day instead
// of all at once. Neil, 2026-09-15: a list of club contacts, "don't send them
// all at once, space them out".
//
// Its own queue rather than cold_outreach, because cold_outreach is one row per
// club with one email on `clubs`, and this list has several people at the same
// club who all get written to. Rows are loaded by scripts/queue-cold-drip.mjs
// with a send_on date; the loader spreads a club's contacts over different
// days, so two people at one club never get the same email the same morning.
//
// Only email 1. The follow-ups stay a manual decision in Focus, because the
// queue cannot see replies and a follow-up to somebody who already answered is
// worse than no follow-up.
const PER_RUN = 8;

async function ensureTable() {
  await sql`CREATE TABLE IF NOT EXISTS cold_drip (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    contact_name TEXT,
    club TEXT NOT NULL,
    send_on DATE NOT NULL,
    sent_at TIMESTAMPTZ,
    message_id TEXT,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY is not set." }, { status: 500 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const email = getColdEmail(1)!;

  await ensureTable();

  // "Today" in Eastern time, so a row dated for Wednesday goes Wednesday
  // morning and not Tuesday evening UTC.
  const due = await sql`
    SELECT id, email, contact_name, club
      FROM cold_drip
     WHERE sent_at IS NULL
       AND error IS NULL
       AND send_on <= (NOW() AT TIME ZONE 'America/New_York')::date
     ORDER BY send_on, id
     LIMIT ${PER_RUN}`;

  const results: { email: string; ok: boolean; error?: string }[] = [];
  for (const row of due) {
    try {
      const sent = await resend.emails.send({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: row.email,
        bcc: BCC,
        replyTo: REPLY_TO,
        subject: email.subject(row.club),
        html: email.html(row.club, row.email, row.contact_name),
      });
      if (sent.error) throw new Error(sent.error.message || "Resend rejected the message.");
      const messageId = sent.data?.id ? `<${sent.data.id}@${SENDER_EMAIL.split("@")[1]}>` : null;
      await sql`UPDATE cold_drip SET sent_at = NOW(), message_id = ${messageId} WHERE id = ${row.id}`;
      results.push({ email: row.email, ok: true });
    } catch (e) {
      // Recorded, and then left alone: a bad address should not be retried
      // every morning forever.
      const msg = e instanceof Error ? e.message : "Send failed.";
      await sql`UPDATE cold_drip SET error = ${msg.slice(0, 500)} WHERE id = ${row.id}`;
      results.push({ email: row.email, ok: false, error: msg });
    }
  }

  const [left] = await sql`SELECT COUNT(*)::int AS n FROM cold_drip WHERE sent_at IS NULL AND error IS NULL`;
  return NextResponse.json({ sent: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, remaining: left.n, results });
}
