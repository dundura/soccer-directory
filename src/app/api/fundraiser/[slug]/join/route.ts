import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import { getFundraiserBySlug, requestToJoinRoster, getUserRosterEntryForFundraiser } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const BASE_URL = process.env.NEXTAUTH_URL || "https://www.soccer-near-me.com";

type Ctx = { params: Promise<{ slug: string }> };

// GET — check if user already has a roster entry
export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ status: "unauthenticated" });
  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);
  if (!fundraiser) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const entry = await getUserRosterEntryForFundraiser(fundraiser.id, session.user.id);
  if (entry) return NextResponse.json({ status: entry.inviteStatus });
  return NextResponse.json({ status: "none" });
}

// POST — request to join the roster
export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must sign in or create an account first" }, { status: 401 });
  }
  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);
  if (!fundraiser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { playerName, position, ageGroup, photoUrl, bio } = await req.json();
  if (!playerName?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  await requestToJoinRoster(fundraiser.id, session.user.id, {
    playerName: playerName.trim(),
    position: position?.trim() || undefined,
    ageGroup: ageGroup?.trim() || undefined,
    photoUrl: photoUrl?.trim() || undefined,
    bio: bio?.trim() || undefined,
  });

  // Notify the fundraiser owner
  if (resend && fundraiser.coachEmail) {
    const editUrl = `${BASE_URL}/fundraiser/${slug}/edit`;
    await resend.emails.send({
      from: "Soccer Near Me <notifications@soccer-near-me.com>",
      to: [fundraiser.coachEmail],
      subject: `Roster request: ${playerName.trim()} wants to join ${fundraiser.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#0f1e35,#1a365d);border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
            <span style="font-size:48px;">&#9917;</span>
            <h1 style="color:white;margin:12px 0 4px;font-size:24px;">New Roster Request</h1>
            <p style="color:rgba(255,255,255,0.7);font-size:16px;margin:0;">${fundraiser.title}</p>
          </div>
          <p style="color:#333;font-size:15px;line-height:1.6;">
            <strong>${playerName.trim()}</strong> has requested to join your fundraiser roster.
            ${position ? `<br/>Position: ${position.trim()}` : ""}
            ${ageGroup ? `<br/>Age Group: ${ageGroup.trim()}` : ""}
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${editUrl}" style="display:inline-block;padding:14px 32px;background:#DC373E;color:white;text-decoration:none;border-radius:10px;font-weight:bold;font-size:15px;">Review Request</a>
          </div>
        </div>
      `,
    }).catch((err) => console.error("Failed to send roster request email:", err));
  }

  return NextResponse.json({ success: true });
}
