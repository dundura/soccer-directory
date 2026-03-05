import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import { getClubReviewComments, createClubReviewComment, getClubReviewById, getUserEmailById } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const NOTIFY_EMAIL = "neil@anytime-soccer.com";

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const comments = await getClubReviewComments(id);
  return NextResponse.json(comments);
}

export async function POST(req: Request, { params }: Props) {
  const { id: reviewId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { body, nickname } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }
  const displayName = nickname?.trim() || session.user.name || "Anonymous";

  try {
    const commentId = await createClubReviewComment(reviewId, session.user.id, displayName, body.trim());

    if (resend) {
      const review = await getClubReviewById(reviewId);
      if (review) {
        const commentHtml = `
          <div style="background:#f7f7f7;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="color:#333;line-height:1.6;margin:0;white-space:pre-wrap;">${body.trim()}</p>
          </div>
          <a href="https://www.soccer-near-me.com/club-reviews" style="display:inline-block;padding:12px 24px;background:#0F3154;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">View Reviews</a>
        `;

        // Admin email — includes account details
        await resend.emails.send({
          from: "Soccer Near Me <notifications@soccer-near-me.com>",
          to: [NOTIFY_EMAIL],
          subject: `New comment on review: ${review.clubName}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2 style="color:#1a365d;">New Comment on Club Review</h2>
              <p><strong>${displayName}</strong> commented on the review for <strong>${review.clubName}</strong>:</p>
              <table style="width:100%;border-collapse:collapse;margin:12px 0;">
                <tr><td style="padding:4px 0;color:#666;width:120px;">Account Email</td><td style="padding:4px 0;font-weight:bold;">${session.user.email || "N/A"}</td></tr>
                <tr><td style="padding:4px 0;color:#666;">Account Name</td><td style="padding:4px 0;">${session.user.name || "N/A"}</td></tr>
                <tr><td style="padding:4px 0;color:#666;">Display Name</td><td style="padding:4px 0;">${displayName}</td></tr>
                <tr><td style="padding:4px 0;color:#666;">User ID</td><td style="padding:4px 0;font-size:12px;color:#999;">${session.user.id}</td></tr>
              </table>
              ${commentHtml}
            </div>
          `,
        }).catch(() => {});

        // Review owner email — no account details
        if (review.userId && review.userId !== session.user.id) {
          const ownerEmail = await getUserEmailById(review.userId);
          if (ownerEmail && ownerEmail !== NOTIFY_EMAIL) {
            await resend.emails.send({
              from: "Soccer Near Me <notifications@soccer-near-me.com>",
              to: [ownerEmail],
              subject: `New comment on your review: ${review.clubName}`,
              html: `
                <div style="font-family:sans-serif;max-width:600px;">
                  <h2 style="color:#1a365d;">New Comment on Your Club Review</h2>
                  <p><strong>${displayName}</strong> commented on your review for <strong>${review.clubName}</strong>:</p>
                  ${commentHtml}
                </div>
              `,
            }).catch(() => {});
          }
        }
      }
    }

    return NextResponse.json({ success: true, id: commentId, userName: displayName });
  } catch {
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
