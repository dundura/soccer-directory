import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getListingEvents,
  createListingEvent,
  updateListingEvent,
  deleteListingEvent,
  getListingOwnerIdById,
  getUserByEmail,
} from "@/lib/db";

async function isOwnerOrAdmin(userId: string, email: string | undefined, listingType: string, listingId: string): Promise<boolean> {
  const ownerId = await getListingOwnerIdById(listingType, listingId);
  if (ownerId === userId) return true;
  if (email) {
    const user = await getUserByEmail(email);
    if (user?.role === "admin") return true;
  }
  return false;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const listingType = searchParams.get("listingType");
  const listingId = searchParams.get("listingId");
  if (!listingType || !listingId) return NextResponse.json({ error: "Missing params" }, { status: 400 });
  const events = await getListingEvents(listingType, listingId);
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { action, listingType, listingId, eventId, title, description, previewImage, eventDate, eventTime, address, location, website, contactEmail, slug } = body;

  if (!listingType || !listingId) return NextResponse.json({ error: "Missing listingType/listingId" }, { status: 400 });

  const allowed = await isOwnerOrAdmin(session.user.id, session.user.email ?? undefined, listingType, listingId);
  if (!allowed) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  try {
    if (action === "create") {
      if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
      const id = await createListingEvent(listingType, listingId, { title, description, previewImage, eventDate, eventTime, address, location, website, contactEmail });
      return NextResponse.json({ id });
    }

    if (action === "update") {
      if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
      await updateListingEvent(eventId, { title, slug, description, previewImage, eventDate, eventTime, address, location, website, contactEmail });
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
      await deleteListingEvent(eventId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Listing events API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
