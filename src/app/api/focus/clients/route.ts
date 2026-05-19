import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTables() {
  await sql`CREATE TABLE IF NOT EXISTS focus_clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS focus_client_activities (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES focus_clients(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTables();
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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTables();
  const { name, email, phone, status, notes } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const rows = await sql`
    INSERT INTO focus_clients (name, email, phone, status, notes)
    VALUES (${name.trim()}, ${email || null}, ${phone || null}, ${status || "Active"}, ${notes || null})
    RETURNING *`;
  return NextResponse.json({ ...rows[0], activities: [] });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, name, email, phone, status, notes } = await req.json();
  await sql`UPDATE focus_clients SET name=${name}, email=${email||null}, phone=${phone||null}, status=${status||"Active"}, notes=${notes||null} WHERE id=${id}`;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await sql`DELETE FROM focus_clients WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
