import { NextResponse } from "next/server";
import { getUserByEmail, createPasswordResetToken } from "@/lib/db";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const BASE_URL = process.env.NEXTAUTH_URL || "https://www.soccer-near-me.com";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = "rst" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await createPasswordResetToken(email, token, expiresAt);

    const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

    if (resend) {
      await resend.emails.send({
        from: "Soccer Near Me <noreply@soccer-near-me.com>",
        to: user.email,
        subject: "Reset your password - Soccer Near Me",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px 20px;">
            <h2 style="color: #0f3162; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #333; line-height: 1.6;">Hi ${user.name},</p>
            <p style="color: #333; line-height: 1.6;">We received a request to reset your password. Click the button below to set a new one:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #DC373E; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 13px; line-height: 1.6;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="color: #999; font-size: 12px;">Soccer Near Me &middot; soccer-near-me.com</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
