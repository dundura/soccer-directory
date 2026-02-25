import { NextResponse } from "next/server";
import { getCamps } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const camps = await getCamps();
  return NextResponse.json(camps);
}
