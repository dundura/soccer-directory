import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFundraiserBySlug, updateRosterEntry, removeRosterEntry } from "@/lib/db";

type Ctx = { params: Promise<{ slug: string }> };

// PUT — player edits their own roster profile
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { entryId, playerName, position, ageGroup, photoUrl, bio } = await req.json();
  if (!entryId || !playerName?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const ok = await updateRosterEntry(entryId, session.user.id, {
    playerName: playerName.trim(),
    position: position?.trim() || undefined,
    ageGroup: ageGroup?.trim() || undefined,
    photoUrl: photoUrl?.trim() || undefined,
    bio: bio?.trim() || undefined,
  });

  if (!ok) return NextResponse.json({ error: "Not found or not yours" }, { status: 404 });
  return NextResponse.json({ success: true });
}

// DELETE — fundraiser owner removes a player from the roster
export async function DELETE(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);
  if (!fundraiser) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (fundraiser.userId !== session.user.id) return NextResponse.json({ error: "Not owner" }, { status: 403 });

  const { entryId } = await req.json();
  if (!entryId) return NextResponse.json({ error: "Missing entryId" }, { status: 400 });

  const ok = await removeRosterEntry(entryId, fundraiser.id);
  if (!ok) return NextResponse.json({ error: "Player not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
