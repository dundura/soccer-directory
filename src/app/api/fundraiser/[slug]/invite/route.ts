import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import { getFundraiserBySlug, invitePlayerToRoster, getRosterWithPendingByFundraiserId } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const BASE_URL = process.env.NEXTAUTH_URL || "https://www.soccer-near-me.com";

type Ctx = { params: Promise<{ slug: string }> };

// GET — return full roster (including pending) for the owner
export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);
  if (!fundraiser) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (fundraiser.userId !== session.user.id) return NextResponse.json({ error: "Not owner" }, { status: 403 });
  const roster = await getRosterWithPendingByFundraiserId(fundraiser.id);
  return NextResponse.json(roster);
}

// POST — invite a player by email
export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);
  if (!fundraiser) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (fundraiser.userId !== session.user.id) return NextResponse.json({ error: "Not owner" }, { status: 403 });

  const { email } = await req.json();
  if (!email?.trim() || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const { token } = await invitePlayerToRoster(fundraiser.id, email.trim());
  const acceptUrl = `${BASE_URL}/fundraiser/join?token=${token}`;

  if (resend) {
    await resend.emails.send({
      from: "Soccer Near Me <notifications@soccer-near-me.com>",
      to: [email.trim()],
      subject: `You're invited to join ${fundraiser.title}!`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#0f1e35,#1a365d);border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
            <span style="font-size:48px;">&#9917;</span>
            <h1 style="color:white;margin:12px 0 4px;font-size:24px;">You're Invited!</h1>
            <p style="color:rgba(255,255,255,0.7);font-size:16px;margin:0;">Join the roster for <strong>${fundraiser.title}</strong></p>
          </div>
          <p style="color:#333;font-size:15px;line-height:1.6;">
            You've been invited to join the fundraiser roster for <strong>${fundraiser.title}</strong> on Soccer Near Me.
            Once you join, supporters can donate on your behalf and you'll be featured on the fundraiser page.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${acceptUrl}" style="display:inline-block;padding:14px 32px;background:#DC373E;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:15px;">Join the Roster</a>
          </div>
          <p style="color:#999;font-size:12px;text-align:center;">
            If you didn't expect this email, you can safely ignore it.
          </p>
        </div>
      `,
    }).catch((err) => console.error("Failed to send roster invite:", err));
  }

  return NextResponse.json({ success: true });
}
