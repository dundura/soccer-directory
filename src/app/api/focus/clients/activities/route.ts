import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

async function ensureColumns() {
  await sql`ALTER TABLE focus_client_activities ADD COLUMN IF NOT EXISTS notes TEXT`;
  await sql`ALTER TABLE focus_client_activities ADD COLUMN IF NOT EXISTS due_date DATE`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureColumns();
  const { client_id, text, notes, due_date } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Text required" }, { status: 400 });
  const rows = await sql`
    INSERT INTO focus_client_activities (client_id, text, notes, due_date)
    VALUES (${client_id}, ${text.trim()}, ${notes || null}, ${due_date || null})
    RETURNING *`;
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureColumns();
  const { id, text, notes, due_date } = await req.json();
  await sql`UPDATE focus_client_activities SET text=${text}, notes=${notes||null}, due_date=${due_date||null} WHERE id=${id}`;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await sql`DELETE FROM focus_client_activities WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
