import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS focus_task_comments (
      id SERIAL PRIMARY KEY,
      task_id INTEGER NOT NULL,
      user_email TEXT NOT NULL,
      text TEXT NOT NULL,
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
    const taskId = searchParams.get("task_id");
    if (!taskId) return NextResponse.json({ error: "Missing task_id" }, { status: 400 });
    const rows = await sql`
      SELECT id, text, created_at FROM focus_task_comments
      WHERE task_id = ${taskId} AND user_email = ${session.user.email}
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
    const { task_id, text } = await req.json();
    const rows = await sql`
      INSERT INTO focus_task_comments (task_id, user_email, text)
      VALUES (${task_id}, ${session.user.email}, ${text})
      RETURNING id, text, created_at
    `;
    return NextResponse.json(rows[0]);
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
    await sql`DELETE FROM focus_task_comments WHERE id = ${id} AND user_email = ${session.user.email}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
