import { getReviewByToken, updateReviewStatus } from "@/lib/db";

type Props = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { token } = await params;
  try {
    const review = await getReviewByToken(token);
    if (!review) {
      return new Response("<html><body style='font-family:sans-serif;text-align:center;padding:40px;'><h1>Review not found</h1></body></html>", { headers: { "Content-Type": "text/html" }, status: 404 });
    }
    if (review.status !== "pending") {
      return new Response(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;"><h1>Review already ${review.status}</h1><p>This review has already been processed.</p><a href="https://www.soccer-near-me.com">Back to Soccer Near Me</a></body></html>`, { headers: { "Content-Type": "text/html" } });
    }
    await updateReviewStatus(token, "rejected");
    return new Response(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;"><h1 style="color:#DC373E;">Review Rejected</h1><p>The review has been rejected and will not appear on the listing.</p><a href="https://www.soccer-near-me.com" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0F3154;color:white;text-decoration:none;border-radius:8px;">Back to Soccer Near Me</a></body></html>`, { headers: { "Content-Type": "text/html" } });
  } catch {
    return new Response("<html><body style='font-family:sans-serif;text-align:center;padding:40px;'><h1>Error processing review</h1></body></html>", { headers: { "Content-Type": "text/html" }, status: 500 });
  }
}
