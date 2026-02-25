import { NextResponse } from "next/server";
import { getGuestOpportunities } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const opportunities = await getGuestOpportunities();
  return NextResponse.json(opportunities);
}
