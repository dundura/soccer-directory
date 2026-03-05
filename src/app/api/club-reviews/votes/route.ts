import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserVotesForReviews } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({});
  }
  const votes = await getUserVotesForReviews(session.user.id);
  return NextResponse.json(votes);
}
