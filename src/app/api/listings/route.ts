import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getListingsByUserId,
  createClubListing,
  createTeamListing,
  createTrainerListing,
  createCampListing,
  createGuestListing,
  createTournamentListing,
  createFutsalListing,
  deleteListing,
} from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
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
      default:
        return NextResponse.json({ error: "Invalid listing type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, slug });
  } catch {
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
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
