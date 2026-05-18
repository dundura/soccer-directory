import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS focus_sessions (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      name TEXT NOT NULL,
      secs INTEGER NOT NULL,
      ts TEXT NOT NULL,
      ds TEXT NOT NULL,
      subtasks JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTable();
    const rows = await sql`
      SELECT id, name, secs, ts, ds, subtasks
      FROM focus_sessions
      WHERE user_email = ${session.user.email}
      ORDER BY created_at DESC
      LIMIT 200
    `;
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTable();
    const { name, secs, ts, ds, subtasks } = await req.json();
    const rows = await sql`
      INSERT INTO focus_sessions (user_email, name, secs, ts, ds, subtasks)
      VALUES (${session.user.email}, ${name}, ${secs}, ${ts}, ${ds}, ${JSON.stringify(subtasks ?? [])})
      RETURNING id
    `;
    return NextResponse.json({ id: rows[0].id });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await sql`DELETE FROM focus_sessions WHERE id = ${id} AND user_email = ${session.user.email}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
