import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notifyNewListing } from "@/lib/notifications";
import {
  getListingsByUserId,
  getListingData,
  createClubListing,
  createTeamListing,
  createTrainerListing,
  createCampListing,
  createGuestListing,
  createTournamentListing,
  createFutsalListing,
  createTripListing,
  createMarketplaceListing,
  updateListing,
  deleteListing,
} from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  // Return single listing data for editing
  if (type && id) {
    const data = await getListingData(type, id, session.user.id);
    if (!data) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  // Return all listings for dashboard
  const listings = await getListingsByUserId(session.user.id);
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { type, data } = await req.json();
    let slug: string;

    switch (type) {
      case "club":
        slug = await createClubListing(data, session.user.id);
        break;
      case "team":
        slug = await createTeamListing(data, session.user.id);
        break;
      case "trainer":
        slug = await createTrainerListing(data, session.user.id);
        break;
      case "camp":
        slug = await createCampListing(data, session.user.id);
        break;
      case "guest":
        slug = await createGuestListing(data, session.user.id);
        break;
      case "tournament":
        slug = await createTournamentListing(data, session.user.id);
        break;
      case "futsal":
        slug = await createFutsalListing(data, session.user.id);
        break;
      case "trip":
        slug = await createTripListing(data, session.user.id);
        break;
      case "marketplace":
        slug = await createMarketplaceListing(data, session.user.id);
        break;
      default:
        return NextResponse.json({ error: "Invalid listing type" }, { status: 400 });
    }

    // Send notifications (don't block the response)
    notifyNewListing(type, data, slug).catch(() => {});

    return NextResponse.json({ success: true, slug });
  } catch {
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { type, id, data } = await req.json();
    if (!type || !id || !data) {
      return NextResponse.json({ error: "Missing type, id, or data" }, { status: 400 });
    }

    const updated = await updateListing(type, id, data, session.user.id);
    if (!updated) {
      return NextResponse.json({ error: "Listing not found or not authorized" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { type, id } = await req.json();
    const deleted = await deleteListing(type, id, session.user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Listing not found or not authorized" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
