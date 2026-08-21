import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";
import { getColdEmail, SENDER_ADDRESS, SENDER_NAME, SENDER_EMAIL, REPLY_TO, BCC } from "@/lib/cold-emails";

const sql = neon(process.env.DATABASE_URL!);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// POST { clubId, emailNumber } — sends one cold email to one club and records it.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!resend) return NextResponse.json({ error: "RESEND_API_KEY is not set." }, { status: 500 });

  // Commercial email to someone who did not ask for it needs a postal address.
  // Refusing here rather than sending without one is deliberate: it is the kind
  // of omission nobody notices until it matters.
  if (!SENDER_ADDRESS.trim()) {
    return NextResponse.json(
      { error: "SENDER_ADDRESS is empty in src/lib/cold-emails.ts. Add a postal address before sending cold email." },
      { status: 400 }
    );
  }

  const { clubId, emailNumber } = await req.json();
  const email = getColdEmail(Number(emailNumber));
  if (!clubId || !email) return NextResponse.json({ error: "clubId and a valid emailNumber are required" }, { status: 400 });

  const rows = await sql`
    SELECT c.id, c.name, c.email,
           COALESCE(o.status, 'not_contacted') AS status,
           o.email1_sent_at, o.email2_sent_at
      FROM clubs c LEFT JOIN cold_outreach o ON o.club_id = c.id
     WHERE c.id = ${clubId} LIMIT 1`;
  const club = rows[0];
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });
  if (!club.email) return NextResponse.json({ error: "That club has no email on file." }, { status: 400 });

  // Never send the same touch twice — the date column is the record.
  const already = email.n === 1 ? club.email1_sent_at : club.email2_sent_at;
  if (already) {
    return NextResponse.json(
      { error: `Email ${email.n} already went to ${club.email} on ${String(already).slice(0, 10)}.` },
      { status: 409 }
    );
  }
  if (email.n === 2 && !club.email1_sent_at) {
    return NextResponse.json({ error: "Send email 1 first — email 2 is a follow-up on the same thread." }, { status: 400 });
  }

  try {
    const sent = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: club.email,
      bcc: BCC,
      replyTo: REPLY_TO,
      subject: email.subject(club.name),
      html: email.html(club.name, club.email),
    });
    if (sent.error) {
      return NextResponse.json({ error: sent.error.message || "Resend rejected the message." }, { status: 502 });
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Send failed." }, { status: 502 });
  }

  const status = email.n === 1 ? "sent_1" : "sent_2";
  await sql`
    INSERT INTO cold_outreach (club_id, status, email1_sent_at, email2_sent_at, updated_at)
    VALUES (${clubId}, ${status},
            ${email.n === 1 ? new Date().toISOString() : null},
            ${email.n === 2 ? new Date().toISOString() : null},
            NOW())
    ON CONFLICT (club_id) DO UPDATE SET
      status = ${status},
      email1_sent_at = COALESCE(cold_outreach.email1_sent_at, ${email.n === 1 ? new Date().toISOString() : null}),
      email2_sent_at = COALESCE(cold_outreach.email2_sent_at, ${email.n === 2 ? new Date().toISOString() : null}),
      updated_at = NOW()`;

  return NextResponse.json({ success: true, sentTo: club.email, emailNumber: email.n });
}
