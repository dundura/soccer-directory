import { NextResponse } from "next/server";
import { getTournaments } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const tournaments = await getTournaments();
  return NextResponse.json(tournaments);
}
