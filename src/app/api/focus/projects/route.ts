import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS focus_projects (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#0F3154',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS focus_project_tasks (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES focus_projects(id) ON DELETE CASCADE,
      user_email TEXT NOT NULL,
      name TEXT NOT NULL,
      total_secs INTEGER DEFAULT 0,
      done BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTables();
    const projects = await sql`
      SELECT id, name, color FROM focus_projects
      WHERE user_email = ${session.user.email}
      ORDER BY created_at DESC
    `;
    const tasks = await sql`
      SELECT id, project_id, name, total_secs, done FROM focus_project_tasks
      WHERE user_email = ${session.user.email}
      ORDER BY created_at ASC
    `;
    const result = projects.map((p: Record<string, unknown>) => ({
      ...p,
      tasks: tasks.filter((t: Record<string, unknown>) => t.project_id === p.id),
    }));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTables();
    const { name, color } = await req.json();
    const rows = await sql`
      INSERT INTO focus_projects (user_email, name, color)
      VALUES (${session.user.email}, ${name}, ${color || '#0F3154'})
      RETURNING id, name, color
    `;
    return NextResponse.json({ ...rows[0], tasks: [] });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await sql`DELETE FROM focus_projects WHERE id = ${id} AND user_email = ${session.user.email}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
