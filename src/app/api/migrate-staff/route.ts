import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  await sql`ALTER TABLE international_trips ADD COLUMN IF NOT EXISTS staff_members jsonb`;
  await sql`ALTER TABLE international_trips ADD COLUMN IF NOT EXISTS extra_videos jsonb`;
  return NextResponse.json({ ok: true });
}
