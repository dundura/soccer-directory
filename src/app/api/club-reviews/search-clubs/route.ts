import { NextRequest, NextResponse } from "next/server";
import { searchClubsForReview } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);
  const clubs = await searchClubsForReview(q);
  return NextResponse.json(clubs);
}
