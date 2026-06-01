import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS focus_client_groups (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      collapsed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE focus_clients ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES focus_client_groups(id) ON DELETE SET NULL`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTable();
  const rows = await sql`
    SELECT * FROM focus_client_groups WHERE user_email = ${session.user.email} ORDER BY sort_order ASC, created_at ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTable();
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const maxOrder = await sql`SELECT COALESCE(MAX(sort_order),0) as m FROM focus_client_groups WHERE user_email = ${session.user.email}`;
  const rows = await sql`
    INSERT INTO focus_client_groups (user_email, name, sort_order)
    VALUES (${session.user.email}, ${name.trim()}, ${(maxOrder[0].m as number) + 1})
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, name, collapsed, sort_order } = await req.json();
  if (name !== undefined) {
    await sql`UPDATE focus_client_groups SET name=${name} WHERE id=${id} AND user_email=${session.user.email}`;
  }
  if (collapsed !== undefined) {
    await sql`UPDATE focus_client_groups SET collapsed=${collapsed} WHERE id=${id} AND user_email=${session.user.email}`;
  }
  if (sort_order !== undefined) {
    await sql`UPDATE focus_client_groups SET sort_order=${sort_order} WHERE id=${id} AND user_email=${session.user.email}`;
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  // Unassign clients from this group before deleting
  await sql`UPDATE focus_clients SET group_id=NULL WHERE group_id=${parseInt(id)}`;
  await sql`DELETE FROM focus_client_groups WHERE id=${parseInt(id)} AND user_email=${session.user.email}`;
  return NextResponse.json({ success: true });
}
