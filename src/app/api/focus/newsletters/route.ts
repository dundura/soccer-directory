import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTables() {
  await sql`CREATE TABLE IF NOT EXISTS focus_newsletters (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    subject TEXT,
    preview_text TEXT,
    sequence INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  // Idempotent migrations
  await sql`ALTER TABLE focus_newsletters ADD COLUMN IF NOT EXISTS subject TEXT`;
  await sql`ALTER TABLE focus_newsletters ADD COLUMN IF NOT EXISTS preview_text TEXT`;
  await sql`ALTER TABLE focus_newsletters ADD COLUMN IF NOT EXISTS sequence INTEGER`;
  await sql`ALTER TABLE focus_newsletters ADD COLUMN IF NOT EXISTS notes TEXT`;
  await sql`CREATE TABLE IF NOT EXISTS focus_newsletter_entries (
    id SERIAL PRIMARY KEY,
    newsletter_id INTEGER REFERENCES focus_newsletters(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'paragraph',
    content TEXT NOT NULL DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`ALTER TABLE focus_newsletter_entries ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'paragraph'`;
  await sql`ALTER TABLE focus_newsletter_entries ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTables();
  const newsletters = await sql`SELECT * FROM focus_newsletters ORDER BY
    CASE WHEN sequence IS NULL THEN 1 ELSE 0 END, sequence ASC, created_at DESC`;
  const entries = await sql`SELECT * FROM focus_newsletter_entries ORDER BY newsletter_id, sort_order, id`;
  const map: Record<number, typeof entries> = {};
  for (const e of entries) {
    if (!map[e.newsletter_id]) map[e.newsletter_id] = [];
    map[e.newsletter_id].push(e);
  }
  return NextResponse.json(newsletters.map(n => ({ ...n, entries: map[n.id] || [] })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTables();
  const { title, subject, preview_text, status, sequence, notes } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const rows = await sql`
    INSERT INTO focus_newsletters (title, subject, preview_text, status, sequence, notes)
    VALUES (${title.trim()}, ${subject || null}, ${preview_text || null}, ${status || "Draft"}, ${sequence ?? null}, ${notes || null})
    RETURNING *`;
  return NextResponse.json({ ...rows[0], entries: [] });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, title, subject, preview_text, status, sequence, notes } = await req.json();
  await sql`UPDATE focus_newsletters SET
    title=${title ?? null},
    subject=${subject || null},
    preview_text=${preview_text || null},
    status=${status || "Draft"},
    sequence=${sequence ?? null},
    notes=${notes ?? null},
    updated_at=NOW()
    WHERE id=${id}`;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await sql`DELETE FROM focus_newsletters WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
