import { NextResponse } from "next/server";
import { getApprovedReviews, getReviewSummary } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ type: string; id: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { type, id } = await params;
  try {
    const [reviews, summary] = await Promise.all([
      getApprovedReviews(type, id),
      getReviewSummary(type, id),
    ]);
    return NextResponse.json({ reviews, averageRating: summary.averageRating, reviewCount: summary.reviewCount });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
