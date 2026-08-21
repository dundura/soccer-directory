import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";
import { getColdEmail, sentAtColumn, sentStatus, SENDER_NAME, SENDER_EMAIL, REPLY_TO, BCC } from "@/lib/cold-emails";

const sql = neon(process.env.DATABASE_URL!);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// POST { clubId, emailNumber } — sends one cold email to one club and records it.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!resend) return NextResponse.json({ error: "RESEND_API_KEY is not set." }, { status: 500 });

  const { clubId, emailNumber } = await req.json();
  const email = getColdEmail(Number(emailNumber));
  if (!clubId || !email) return NextResponse.json({ error: "clubId and a valid emailNumber are required" }, { status: 400 });

  const rows = await sql`
    SELECT c.id, c.name, c.email,
           COALESCE(o.status, 'not_contacted') AS status,
           o.email1_sent_at, o.email2_sent_at, o.email3_sent_at,
           o.email4_sent_at, o.email5_sent_at, o.contact_name, o.email1_message_id
      FROM clubs c LEFT JOIN cold_outreach o ON o.club_id = c.id
     WHERE c.id = ${clubId} LIMIT 1`;
  const club = rows[0];
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });
  if (!club.email) return NextResponse.json({ error: "That club has no email on file." }, { status: 400 });

  // Never send the same touch twice — the date column is the record.
  //
  // Read by column name rather than a ladder of ternaries. The old form had
  // "everything that is not 1 or 2" fall through to email 3, so the moment a
  // fourth touch existed it would have checked email 3's date, found it set,
  // and refused to send — or found it empty and sent a duplicate.
  const already = club[sentAtColumn(email.n)] as string | null;
  if (already) {
    return NextResponse.json(
      { error: `Email ${email.n} already went to ${club.email} on ${String(already).slice(0, 10)}.` },
      { status: 409 }
    );
  }
  if (email.n === 2 && !club.email1_sent_at) {
    return NextResponse.json({ error: "Send email 1 first — email 2 is a follow-up on the same thread." }, { status: 400 });
  }

  // Real threading, not just a "Re:" prefix. Email 1's Message-ID is kept and
  // quoted back on the follow-up, so a mail client stacks them in one
  // conversation instead of showing two unrelated messages.
  let messageId: string | null = null;
  const parent = club.email1_message_id as string | null;
  const headers =
    email.n === 2 && parent ? { "In-Reply-To": parent, References: parent } : undefined;

  try {
    const sent = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: club.email,
      bcc: BCC,
      replyTo: REPLY_TO,
      subject: email.subject(club.name),
      html: email.html(club.name, club.email, club.contact_name),
      ...(headers ? { headers } : {}),
    });
    if (sent.error) {
      return NextResponse.json({ error: sent.error.message || "Resend rejected the message." }, { status: 502 });
    }
    // Resend returns its own id; the RFC Message-ID it stamps is that id at
    // the sending domain, which is what a client threads on.
    if (email.n === 1 && sent.data?.id) messageId = `<${sent.data.id}@${SENDER_EMAIL.split("@")[1]}>`;
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Send failed." }, { status: 502 });
  }

  const status = sentStatus(email.n);
  const now = new Date().toISOString();
  const at = (n: number) => (email.n === n ? now : null);

  await sql`
    INSERT INTO cold_outreach (club_id, status, email1_sent_at, email2_sent_at, email3_sent_at, email4_sent_at, email5_sent_at, email1_message_id, updated_at)
    VALUES (${clubId}, ${status},
            ${at(1)}, ${at(2)}, ${at(3)}, ${at(4)}, ${at(5)},
            ${messageId},
            NOW())
    ON CONFLICT (club_id) DO UPDATE SET
      status = ${status},
      email1_sent_at = COALESCE(cold_outreach.email1_sent_at, ${at(1)}),
      email2_sent_at = COALESCE(cold_outreach.email2_sent_at, ${at(2)}),
      email3_sent_at = COALESCE(cold_outreach.email3_sent_at, ${at(3)}),
      email4_sent_at = COALESCE(cold_outreach.email4_sent_at, ${at(4)}),
      email5_sent_at = COALESCE(cold_outreach.email5_sent_at, ${at(5)}),
      email1_message_id = COALESCE(cold_outreach.email1_message_id, ${messageId}),
      updated_at = NOW()`;

  return NextResponse.json({ success: true, sentTo: club.email, emailNumber: email.n });
}
