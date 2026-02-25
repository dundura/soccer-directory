import { NextResponse } from "next/server";
import { getClubs } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const clubs = await getClubs();
  return NextResponse.json(clubs);
}
