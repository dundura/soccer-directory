import { NextResponse } from "next/server";
import { getFutsalTeams } from "@/lib/db";

export async function GET() {
  const teams = await getFutsalTeams();
  return NextResponse.json(teams);
}
