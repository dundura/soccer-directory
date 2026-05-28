import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { newsletter_id, type, content, sort_order } = await req.json();
  if (!newsletter_id) return NextResponse.json({ error: "newsletter_id required" }, { status: 400 });
  const rows = await sql`
    INSERT INTO focus_newsletter_entries (newsletter_id, type, content, sort_order)
    VALUES (${newsletter_id}, ${type || "paragraph"}, ${content || ""}, ${sort_order ?? 0})
    RETURNING *`;
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, type, content, sort_order } = await req.json();
  await sql`UPDATE focus_newsletter_entries
    SET type=${type}, content=${content}, sort_order=${sort_order}
    WHERE id=${id}`;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await sql`DELETE FROM focus_newsletter_entries WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
