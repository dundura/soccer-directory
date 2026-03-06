import { NextResponse } from "next/server";
import { getReviewInvitation, getListingSlugById } from "@/lib/db";
import { getListingPath } from "@/lib/utils";

type Props = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { token } = await params;

  const invitation = await getReviewInvitation(token);
  if (!invitation) {
    return new Response(
      '<html><body style="font-family:sans-serif;text-align:center;padding:40px;"><h1>Invitation not found</h1><p>This review invitation link is invalid or has expired.</p><a href="https://www.soccer-near-me.com">Back to Soccer Near Me</a></body></html>',
      { headers: { "Content-Type": "text/html" }, status: 404 }
    );
  }

  if (invitation.status === "completed") {
    return new Response(
      '<html><body style="font-family:sans-serif;text-align:center;padding:40px;"><h1>Review already submitted</h1><p>You have already submitted a review for this invitation.</p><a href="https://www.soccer-near-me.com">Back to Soccer Near Me</a></body></html>',
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const slug = await getListingSlugById(invitation.listingType, invitation.listingId);
  if (!slug) {
    return new Response(
      '<html><body style="font-family:sans-serif;text-align:center;padding:40px;"><h1>Listing not found</h1><a href="https://www.soccer-near-me.com">Back to Soccer Near Me</a></body></html>',
      { headers: { "Content-Type": "text/html" }, status: 404 }
    );
  }

  const path = getListingPath(invitation.listingType, slug);
  return NextResponse.redirect(`https://www.soccer-near-me.com${path}?reviewToken=${token}`);
}
