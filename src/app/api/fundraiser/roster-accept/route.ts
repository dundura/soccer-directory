import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRosterEntryByToken, acceptRosterInvite } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const entry = await getRosterEntryByToken(token);
  if (!entry) return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
  return NextResponse.json({
    fundraiserTitle: entry.fundraiserTitle,
    fundraiserSlug: entry.fundraiserSlug,
    email: entry.email,
    inviteStatus: entry.inviteStatus,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must sign in or create an account first" }, { status: 401 });
  }

  const { token, playerName, position, ageGroup, photoUrl, bio } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  if (!playerName?.trim()) return NextResponse.json({ error: "Player name is required" }, { status: 400 });

  const entry = await getRosterEntryByToken(token);
  if (!entry) return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });

  const ok = await acceptRosterInvite(token, session.user.id, {
    playerName: playerName.trim(),
    position: position?.trim() || undefined,
    ageGroup: ageGroup?.trim() || undefined,
    photoUrl: photoUrl?.trim() || undefined,
    bio: bio?.trim() || undefined,
  });

  if (!ok) return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
  return NextResponse.json({ success: true, slug: entry.fundraiserSlug });
}
