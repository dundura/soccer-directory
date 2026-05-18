import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS focus_todos (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      list_key TEXT NOT NULL DEFAULT 'todo',
      text TEXT NOT NULL,
      notes TEXT,
      done BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || "todo";
    const rows = await sql`
      SELECT id, text, notes, done
      FROM focus_todos
      WHERE user_email = ${session.user.email} AND list_key = ${key}
      ORDER BY created_at ASC
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
    const { text, notes, key } = await req.json();
    const listKey = key || "todo";
    const rows = await sql`
      INSERT INTO focus_todos (user_email, list_key, text, notes)
      VALUES (${session.user.email}, ${listKey}, ${text}, ${notes ?? null})
      RETURNING id, text, notes, done
    `;
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, done } = await req.json();
    await sql`
      UPDATE focus_todos SET done = ${done}
      WHERE id = ${id} AND user_email = ${session.user.email}
    `;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await sql`DELETE FROM focus_todos WHERE id = ${id} AND user_email = ${session.user.email}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
