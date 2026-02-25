import { NextResponse } from "next/server";
import { getTrainers } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const trainers = await getTrainers();
  return NextResponse.json(trainers);
}
