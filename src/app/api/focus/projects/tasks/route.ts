import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function ensureHiddenColumn() {
  await sql`ALTER TABLE focus_project_tasks ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE`.catch(() => {});
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureHiddenColumn();
    const { searchParams } = new URL(req.url);
    const standalone = searchParams.get("standalone");
    const rows = standalone
      ? await sql`SELECT id, project_id, name, total_secs, done, hidden FROM focus_project_tasks WHERE user_email = ${session.user.email} AND project_id IS NULL ORDER BY created_at ASC`
      : await sql`SELECT id, project_id, name, total_secs, done, hidden FROM focus_project_tasks WHERE user_email = ${session.user.email} ORDER BY created_at ASC`;
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { project_id, name } = await req.json();
    const rows = await sql`
      INSERT INTO focus_project_tasks (project_id, user_email, name)
      VALUES (${project_id}, ${session.user.email}, ${name})
      RETURNING id, project_id, name, total_secs, done, hidden
    `;
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, add_secs, done, reset, hidden } = await req.json();
    if (reset) {
      await sql`UPDATE focus_project_tasks SET total_secs = 0 WHERE id = ${id} AND user_email = ${session.user.email}`;
    } else if (add_secs !== undefined) {
      await sql`UPDATE focus_project_tasks SET total_secs = total_secs + ${add_secs} WHERE id = ${id} AND user_email = ${session.user.email}`;
    }
    if (done !== undefined) {
      await sql`UPDATE focus_project_tasks SET done = ${done} WHERE id = ${id} AND user_email = ${session.user.email}`;
    }
    if (hidden !== undefined) {
      await sql`UPDATE focus_project_tasks SET hidden = ${hidden} WHERE id = ${id} AND user_email = ${session.user.email}`;
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await sql`DELETE FROM focus_project_tasks WHERE id = ${id} AND user_email = ${session.user.email}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
