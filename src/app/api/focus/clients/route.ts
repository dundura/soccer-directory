import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTables() {
  await sql`CREATE TABLE IF NOT EXISTS focus_clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'Lead',
    team TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`ALTER TABLE focus_clients ADD COLUMN IF NOT EXISTS team TEXT`;
  await sql`ALTER TABLE focus_clients ADD COLUMN IF NOT EXISTS contact_date DATE`;
  await sql`CREATE TABLE IF NOT EXISTS focus_client_activities (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES focus_clients(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTables();
  await sql`ALTER TABLE focus_clients ADD COLUMN IF NOT EXISTS group_id INTEGER`;
  const clients = await sql`SELECT * FROM focus_clients ORDER BY created_at DESC`;
  const activities = await sql`SELECT * FROM focus_client_activities ORDER BY created_at ASC`;
  const map: Record<number, typeof activities> = {};
  for (const a of activities) {
    if (!map[a.client_id]) map[a.client_id] = [];
    map[a.client_id].push(a);
  }
  return NextResponse.json(clients.map(c => ({ ...c, activities: map[c.id] || [] })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTables();
  const { name, email, phone, status, team, notes, contact_date } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const rows = await sql`
    INSERT INTO focus_clients (name, email, phone, status, team, notes, contact_date)
    VALUES (${name.trim()}, ${email || null}, ${phone || null}, ${status || "Lead"}, ${team || null}, ${notes || null}, ${contact_date || null})
    RETURNING *`;
  return NextResponse.json({ ...rows[0], activities: [] });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, name, email, phone, status, team, notes, contact_date, group_id } = await req.json();
  if (group_id !== undefined && name === undefined) {
    // Group assignment only
    await sql`UPDATE focus_clients SET group_id=${group_id} WHERE id=${id}`;
  } else {
    await sql`UPDATE focus_clients SET name=${name}, email=${email||null}, phone=${phone||null}, status=${status||"Lead"}, team=${team||null}, notes=${notes||null}, contact_date=${contact_date||null} WHERE id=${id}`;
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await sql`DELETE FROM focus_clients WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
