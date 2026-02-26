import { NextResponse } from "next/server";
import { getInternationalTrips } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const trips = await getInternationalTrips();
  return NextResponse.json(trips);
}
