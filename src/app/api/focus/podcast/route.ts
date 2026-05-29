import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTable() {
  await sql`CREATE TABLE IF NOT EXISTS focus_podcast (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`ALTER TABLE focus_podcast ADD COLUMN IF NOT EXISTS url TEXT`;
  await sql`ALTER TABLE focus_podcast ADD COLUMN IF NOT EXISTS notes TEXT`;
  await sql`ALTER TABLE focus_podcast ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft'`;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTable();
  const rows = await sql`SELECT * FROM focus_podcast ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTable();
  const { title, url, notes, status } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const rows = await sql`
    INSERT INTO focus_podcast (title, url, notes, status)
    VALUES (${title.trim()}, ${url || null}, ${notes || null}, ${status || "Draft"})
    RETURNING *`;
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, title, url, notes, status } = await req.json();
  await sql`UPDATE focus_podcast SET
    title=${title ?? null},
    url=${url || null},
    notes=${notes || null},
    status=${status || "Draft"},
    updated_at=NOW()
    WHERE id=${id}`;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await sql`DELETE FROM focus_podcast WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
