import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

// Outreach state lives in its own table rather than on `clubs`, which already
// has a `status` column meaning something else entirely (the listing's own
// state). One row per club, created on first update.
async function ensureTable() {
  await sql`CREATE TABLE IF NOT EXISTS cold_outreach (
    club_id INTEGER PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'not_contacted',
    email1_sent_at TIMESTAMPTZ,
    email2_sent_at TIMESTAMPTZ,
    notes TEXT,
    contact_name TEXT,
    email1_message_id TEXT,
    email3_sent_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`ALTER TABLE cold_outreach ADD COLUMN IF NOT EXISTS contact_name TEXT`;
  await sql`ALTER TABLE cold_outreach ADD COLUMN IF NOT EXISTS email1_message_id TEXT`;
  await sql`ALTER TABLE cold_outreach ADD COLUMN IF NOT EXISTS email3_sent_at TIMESTAMPTZ`;
}

export const STATUSES = [
  "not_contacted",
  "sent_1",
  "sent_2",
  "sent_3",
  "replied",
  "claimed",
  "not_interested",
];

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTable();

  const rows = await sql`
    SELECT c.id, c.name, c.city, c.state, c.email, c.phone, c.website, c.slug,
           COALESCE(o.status, 'not_contacted') AS status,
           o.email1_sent_at, o.email2_sent_at, o.email3_sent_at, o.notes, o.contact_name
      FROM clubs c
      LEFT JOIN cold_outreach o ON o.club_id = c.id
     ORDER BY (c.email IS NULL), c.state NULLS LAST, c.name`;

  return NextResponse.json({ clubs: rows, statuses: STATUSES });
}

// PATCH { clubId, status?, notes? } — records where a club has got to.
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTable();

  const { clubId, status, notes, contactName } = await req.json();
  if (!clubId) return NextResponse.json({ error: "clubId required" }, { status: 400 });
  if (status && !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Unknown status" }, { status: 400 });
  }

  // Stamping the send dates off the status keeps "when did email 1 go" true
  // without a second click, and COALESCE means re-selecting a status never
  // rewrites a date that is already set.
  await sql`
    INSERT INTO cold_outreach (club_id, status, notes, contact_name, email1_sent_at, email2_sent_at, updated_at)
    VALUES (
      ${clubId},
      ${status || "not_contacted"},
      ${notes ?? null},
      ${contactName ?? null},
      ${status === "sent_1" || status === "sent_2" ? new Date().toISOString() : null},
      ${status === "sent_2" ? new Date().toISOString() : null},
      NOW()
    )
    ON CONFLICT (club_id) DO UPDATE SET
      status = COALESCE(${status || null}, cold_outreach.status),
      notes = COALESCE(${notes ?? null}, cold_outreach.notes),
      contact_name = COALESCE(${contactName ?? null}, cold_outreach.contact_name),
      email1_sent_at = COALESCE(cold_outreach.email1_sent_at, ${status === "sent_1" || status === "sent_2" ? new Date().toISOString() : null}),
      email2_sent_at = COALESCE(cold_outreach.email2_sent_at, ${status === "sent_2" ? new Date().toISOString() : null}),
      updated_at = NOW()`;

  return NextResponse.json({ success: true });
}
