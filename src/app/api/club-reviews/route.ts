import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import { createClubReview, getApprovedClubReviews, updateClubReview, deleteClubReview } from "@/lib/db";
import { escapeHtml } from "@/lib/utils";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const NOTIFY_EMAIL = "neil@anytime-soccer.com";
const BASE_URL = "https://www.soccer-near-me.com";

export async function GET() {
  const reviews = await getApprovedClubReviews();
  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be signed in to submit a review" }, { status: 401 });
  }

  const data = await req.json();

  if (!data.clubName?.trim()) {
    return NextResponse.json({ error: "Club name is required" }, { status: 400 });
  }
  if (!data.reviewerName?.trim()) {
    return NextResponse.json({ error: "Your name is required" }, { status: 400 });
  }
  for (const key of ["ratingPrice", "ratingQuality", "ratingCoaching"]) {
    const v = Number(data[key]);
    if (!v || v < 1 || v > 5) {
      return NextResponse.json({ error: "All ratings are required (1-5 stars)" }, { status: 400 });
    }
  }

  try {
    const { approvalToken } = await createClubReview({
      clubName: data.clubName.trim(),
      city: data.city?.trim() || "",
      state: data.state?.trim() || "",
      ratingPrice: Number(data.ratingPrice),
      ratingQuality: Number(data.ratingQuality),
      ratingCoaching: Number(data.ratingCoaching),
      reviewerName: data.reviewerName.trim(),
      reviewerRole: data.reviewerRole || "",
      reviewText: data.reviewText?.trim() || "",
      clubId: data.clubId || undefined,
    }, session.user.id);

    if (resend) {
      const approveUrl = `${BASE_URL}/api/club-reviews/approve?token=${approvalToken}`;
      const rejectUrl = `${BASE_URL}/api/club-reviews/reject?token=${approvalToken}`;
      const overall = Math.round((Number(data.ratingPrice) + Number(data.ratingQuality) + Number(data.ratingCoaching)) / 3);
      const overallStars = "\u2605".repeat(overall) + "\u2606".repeat(5 - overall);
      const safeClubName = escapeHtml(data.clubName.trim());
      const safeCity = escapeHtml(data.city || "N/A");
      const safeState = escapeHtml(data.state || "N/A");
      const safeReviewerName = escapeHtml(data.reviewerName.trim());
      const safeReviewerRole = escapeHtml(data.reviewerRole || "N/A");
      const safeReviewText = data.reviewText ? escapeHtml(data.reviewText.trim()) : "";
      const safeEmail = escapeHtml(session.user.email || "N/A");
      const safeAccountName = escapeHtml(session.user.name || "N/A");

      await resend.emails.send({
        from: "Soccer Near Me <notifications@soccer-near-me.com>",
        to: [NOTIFY_EMAIL],
        subject: `New Club Review: ${data.clubName.trim()} (${overallStars})`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;">
            <h2 style="color:#1a365d;">New Club Review Submitted</h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px 0;color:#666;width:120px;">Club</td><td style="padding:8px 0;font-weight:bold;">${safeClubName}${data.clubId ? ' <span style="background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;">Listed Club</span>' : ' <span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;">Not in Directory</span>'}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Location</td><td style="padding:8px 0;">${safeCity}, ${safeState}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Reviewer</td><td style="padding:8px 0;">${safeReviewerName} (${safeReviewerRole})</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Account Email</td><td style="padding:8px 0;font-weight:bold;">${safeEmail}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Account Name</td><td style="padding:8px 0;">${safeAccountName}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Price</td><td style="padding:8px 0;font-size:18px;">${"\u2605".repeat(data.ratingPrice)}${"\u2606".repeat(5 - data.ratingPrice)}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Quality</td><td style="padding:8px 0;font-size:18px;">${"\u2605".repeat(data.ratingQuality)}${"\u2606".repeat(5 - data.ratingQuality)}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Coaching</td><td style="padding:8px 0;font-size:18px;">${"\u2605".repeat(data.ratingCoaching)}${"\u2606".repeat(5 - data.ratingCoaching)}</td></tr>
            </table>
            ${safeReviewText ? `<div style="background:#f7f7f7;padding:16px;border-radius:8px;margin:16px 0;"><p style="color:#333;line-height:1.6;margin:0;white-space:pre-wrap;">${safeReviewText}</p></div>` : ""}
            <div style="margin-top:24px;">
              <a href="${approveUrl}" style="display:inline-block;padding:12px 24px;background:#22c55e;color:white;text-decoration:none;border-radius:8px;margin-right:12px;font-weight:bold;">Approve</a>
              <a href="${rejectUrl}" style="display:inline-block;padding:12px 24px;background:#DC373E;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Reject</a>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to submit review" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const data = await req.json();
  if (!data.id || !data.clubName?.trim() || !data.reviewerName?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  for (const key of ["ratingPrice", "ratingQuality", "ratingCoaching"]) {
    const v = Number(data[key]);
    if (!v || v < 1 || v > 5) {
      return NextResponse.json({ error: "All ratings are required (1-5 stars)" }, { status: 400 });
    }
  }
  const updated = await updateClubReview(data.id, session.user.id, {
    clubName: data.clubName.trim(),
    city: data.city?.trim() || "",
    state: data.state?.trim() || "",
    ratingPrice: Number(data.ratingPrice),
    ratingQuality: Number(data.ratingQuality),
    ratingCoaching: Number(data.ratingCoaching),
    reviewerName: data.reviewerName.trim(),
    reviewerRole: data.reviewerRole || "",
    reviewText: data.reviewText?.trim() || "",
  });
  if (!updated) {
    return NextResponse.json({ error: "Review not found or not yours" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Review ID required" }, { status: 400 });
  }
  const deleted = await deleteClubReview(id, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: "Review not found or not yours" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
