import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import { createReviewInvitation, getListingOwnerIdById, getListingNameById } from "@/lib/db";
import { escapeHtml } from "@/lib/utils";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const BASE_URL = "https://www.soccer-near-me.com";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be signed in" }, { status: 401 });
  }

  const { listingType, listingId, email, name } = await req.json();

  if (!listingType || !listingId || !email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Verify the user owns this listing or is an admin
  const isAdmin = (session.user as { role?: string }).role === "admin";
  if (!isAdmin) {
    const ownerId = await getListingOwnerIdById(listingType, listingId);
    if (ownerId !== session.user.id) {
      return NextResponse.json({ error: "You can only invite reviews for your own listings" }, { status: 403 });
    }
  }

  try {
    const { token } = await createReviewInvitation(listingType, listingId, email.trim(), name?.trim() || undefined, session.user.id);
    const listingName = await getListingNameById(listingType, listingId);
    const reviewUrl = `${BASE_URL}/api/reviews/accept/${token}`;
    const safeName = escapeHtml(name?.trim() || "");
    const safeListingName = escapeHtml(listingName || "a listing");
    const greeting = safeName ? `Hi ${safeName},` : "Hi,";

    if (resend) {
      await resend.emails.send({
        from: "Soccer Near Me <notifications@soccer-near-me.com>",
        to: [email.trim()],
        subject: `You're invited to review ${listingName || "a listing"} on Soccer Near Me`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;">
            <h2 style="color:#1a365d;">You've Been Invited to Leave a Review</h2>
            <p style="color:#333;line-height:1.6;">${greeting}</p>
            <p style="color:#333;line-height:1.6;">You've been invited to share your experience with <strong>${safeListingName}</strong> on Soccer Near Me.</p>
            <p style="color:#333;line-height:1.6;">Your feedback helps other families find the right soccer programs for their kids.</p>
            <div style="margin:32px 0;text-align:center;">
              <a href="${reviewUrl}" style="display:inline-block;padding:14px 32px;background:#DC373E;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Write Your Review</a>
            </div>
            <p style="color:#999;font-size:12px;line-height:1.5;">This invitation was sent by the listing owner. If you didn't expect this email, you can safely ignore it.</p>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to send invitation" }, { status: 500 });
  }
}
