import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const NOTIFY_EMAIL = "neil@anytime-soccer.com";

export async function POST(req: Request) {
  try {
    const { commentId, commentBody, topicSlug, reason } = await req.json();
    if (!commentId || !topicSlug) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    if (resend) {
      await resend.emails.send({
        from: "Soccer Near Me <notifications@soccer-near-me.com>",
        to: NOTIFY_EMAIL,
        subject: "Forum Comment Reported",
        html: `
          <div style="font-family:sans-serif;max-width:600px;">
            <h2 style="color:#DC373E;">Reported Comment</h2>
            <p><strong>Comment ID:</strong> ${commentId}</p>
            <p><strong>Reason:</strong> ${reason || "No reason given"}</p>
            <div style="background:#f7f7f7;padding:16px;border-radius:8px;margin:16px 0;">
              <p style="color:#333;line-height:1.6;margin:0;">${commentBody || ""}</p>
            </div>
            <a href="https://www.soccer-near-me.com/forum/${topicSlug}" style="display:inline-block;padding:12px 24px;background:#0F3154;color:white;text-decoration:none;border-radius:8px;">View Topic</a>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to report" }, { status: 500 });
  }
}
