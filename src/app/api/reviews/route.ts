import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createReview, getListingNameById, getListingOwnerEmailById } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const NOTIFY_EMAIL = "neil@anytime-soccer.com";
const BASE_URL = "https://www.soccer-near-me.com";

export async function POST(req: Request) {
  try {
    const { listingType, listingId, reviewerName, reviewerRole, rating, reviewText } = await req.json();

    if (!listingType || !listingId || !reviewerName || !reviewerRole || !rating || !reviewText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const { approvalToken } = await createReview(listingType, listingId, reviewerName, reviewerRole, rating, reviewText);
    const listingName = await getListingNameById(listingType, listingId);
    const ownerEmail = await getListingOwnerEmailById(listingType, listingId);
    const approveUrl = `${BASE_URL}/api/reviews/approve/${approvalToken}`;
    const rejectUrl = `${BASE_URL}/api/reviews/reject/${approvalToken}`;
    const stars = "\u2605".repeat(rating) + "\u2606".repeat(5 - rating);

    if (resend) {
      const recipients = [NOTIFY_EMAIL];
      if (ownerEmail && ownerEmail !== NOTIFY_EMAIL) recipients.push(ownerEmail);

      await resend.emails.send({
        from: "Soccer Near Me <notifications@soccer-near-me.com>",
        to: recipients,
        subject: `New Review for ${listingName || "a listing"}: ${stars}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;">
            <h2 style="color:#1a365d;">New Review Submitted</h2>
            <p style="color:#666;">A new review has been submitted for <strong>${listingName}</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px 0;color:#666;width:120px;">Reviewer</td><td style="padding:8px 0;font-weight:bold;">${reviewerName}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Role</td><td style="padding:8px 0;">${reviewerRole}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Rating</td><td style="padding:8px 0;font-size:18px;">${stars}</td></tr>
            </table>
            <div style="background:#f7f7f7;padding:16px;border-radius:8px;margin:16px 0;">
              <p style="color:#333;line-height:1.6;margin:0;white-space:pre-wrap;">${reviewText}</p>
            </div>
            <div style="margin-top:24px;">
              <a href="${approveUrl}" style="display:inline-block;padding:12px 24px;background:#22c55e;color:white;text-decoration:none;border-radius:8px;margin-right:12px;font-weight:bold;">Approve</a>
              <a href="${rejectUrl}" style="display:inline-block;padding:12px 24px;background:#DC373E;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">Reject</a>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
