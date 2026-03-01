import { NextResponse } from "next/server";
import { getTryouts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const tryouts = await getTryouts();
  return NextResponse.json(tryouts);
}
