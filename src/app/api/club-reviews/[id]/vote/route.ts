import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { voteClubReview } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Props) {
  const { id: reviewId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { voteType } = await req.json();
  if (voteType !== "like" && voteType !== "dislike") {
    return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
  }

  try {
    const counts = await voteClubReview(reviewId, session.user.id, voteType);
    return NextResponse.json(counts);
  } catch {
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
