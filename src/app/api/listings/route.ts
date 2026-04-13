import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notifyNewListing } from "@/lib/notifications";
import {
  getListingsByUserId,
  getListingData,
  getListingDataAdmin,
  updateListingAdmin,
  getUserByEmail,
  createClubListing,
  createTeamListing,
  createTrainerListing,
  createCampListing,
  createGuestListing,
  createTournamentListing,
  createFutsalListing,
  createTripListing,
  createMarketplaceListing,
  createPlayerProfile,
  createPodcastListing,
  createFacebookGroupListing,
  createInstagramPageListing,
  createTikTokPageListing,
  createServiceListing,
  createSoccerBookListing,
  createPhotoVideoServiceListing,
  createTryoutListing,
  createSpecialEventListing,
  createRecruiterListing,
  createTrainingAppListing,
  createBlogListing,
  createYoutubeChannelListing,
  createScrimmageListing,
  updateListing,
  archiveListing,
  deleteListing,
  createFundraiser,
} from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    // Return single listing data for editing
    if (type && id) {
      // Try owner-scoped first, fall back to admin if user is admin
      let data = await getListingData(type, id, session.user.id);
      if (!data && session.user.email) {
        const user = await getUserByEmail(session.user.email);
        if (user?.role === "admin") {
          data = await getListingDataAdmin(type, id);
        }
      }
      if (!data) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    // Return all listings for dashboard
    const listings = await getListingsByUserId(session.user.id);
    return NextResponse.json(listings);
  } catch (err) {
    console.error("Failed to fetch listings:", err);
    return NextResponse.json({ error: "Failed to fetch listings", detail: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
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
      case "equipment":
        data.category = "Equipment";
        slug = await createMarketplaceListing(data, session.user.id);
        break;
      case "gear":
        data.category = "Gear";
        slug = await createMarketplaceListing(data, session.user.id);
        break;
      case "books":
        data.category = "Books";
        slug = await createMarketplaceListing(data, session.user.id);
        break;
      case "showcase":
        data.campType = "College Showcase";
        slug = await createCampListing(data, session.user.id);
        break;
      case "player":
        slug = await createPlayerProfile(data, session.user.id);
        break;
      case "podcast":
        slug = await createPodcastListing(data, session.user.id);
        break;
      case "fbgroup":
        slug = await createFacebookGroupListing(data, session.user.id);
        break;
      case "instagrampage":
        slug = await createInstagramPageListing(data, session.user.id);
        break;
      case "tiktokpage":
        slug = await createTikTokPageListing(data, session.user.id);
        break;
      case "service":
        slug = await createServiceListing(data, session.user.id);
        break;
      case "soccerbook":
        slug = await createSoccerBookListing(data, session.user.id);
        break;
      case "photovideo":
        slug = await createPhotoVideoServiceListing(data, session.user.id);
        break;
      case "tryout":
        slug = await createTryoutListing(data, session.user.id);
        break;
      case "specialevent":
        slug = await createSpecialEventListing(data, session.user.id);
        break;
      case "recruiter":
        slug = await createRecruiterListing(data, session.user.id);
        break;
      case "trainingapp":
        slug = await createTrainingAppListing(data, session.user.id);
        break;
      case "blog":
        slug = await createBlogListing(data, session.user.id);
        break;
      case "ebook":
        data.category = "Ebook";
        slug = await createMarketplaceListing(data, session.user.id);
        break;
      case "giveaway":
        data.category = "Giveaway";
        slug = await createMarketplaceListing(data, session.user.id);
        break;
      case "youtube":
        slug = await createYoutubeChannelListing(data, session.user.id);
        break;
      case "scrimmage":
        slug = await createScrimmageListing(data, session.user.id);
        break;
      case "fundraiser":
        slug = await createFundraiser({
          title: data.name,
          description: data.description,
          goal: data.goal && !isNaN(Number(data.goal)) ? String(Math.round(Number(data.goal) * 100)) : "",
          coachName: data.coachName,
          coachEmail: data.contactEmail,
          coachPhone: data.phone,
          websiteUrl: data.website,
          facebookUrl: data.facebookUrl,
          instagramUrl: data.instagramUrl,
          heroImageUrl: data.imageUrl,
          tags: data.tags,
          photos: data.photos,
          videoUrl: data.videoUrl,
          teamPhoto: data.teamPhoto,
          announcementHeading: data.announcementHeading,
          announcementText: data.announcementText,
          announcementImage: data.announcementImage,
          announcementCta: data.announcementCta,
          announcementCtaUrl: data.announcementCtaUrl,
          announcementHeading2: data.announcementHeading2,
          announcementText2: data.announcementText2,
          announcementImage2: data.announcementImage2,
          announcementCta2: data.announcementCta2,
          announcementCtaUrl2: data.announcementCtaUrl2,
          announcementHeading3: data.announcementHeading3,
          announcementText3: data.announcementText3,
          announcementImage3: data.announcementImage3,
          announcementCta3: data.announcementCta3,
          announcementCtaUrl3: data.announcementCtaUrl3,
          roster: data.roster,
        }, session.user.id);
        break;
      default:
        return NextResponse.json({ error: "Invalid listing type" }, { status: 400 });
    }

    // Send notifications (don't block the response)
    notifyNewListing(type, data, slug).catch(() => {});

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error("Failed to create listing:", err);
    return NextResponse.json({ error: "Failed to create listing", detail: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
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

    let updated = await updateListing(type, id, data, session.user.id);
    if (!updated && session.user.email) {
      const user = await getUserByEmail(session.user.email);
      if (user?.role === "admin") {
        updated = await updateListingAdmin(type, id, data);
      }
    }
    if (!updated) {
      return NextResponse.json({ error: "Listing not found or not authorized" }, { status: 404 });
    }
    // Get the slug for redirect
    const { getListingSlugById } = await import("@/lib/db");
    const slug = await getListingSlugById(type, id) || id;
    return NextResponse.json({ success: true, slug, type });
  } catch (err) {
    if (err instanceof Error && err.message === "SLUG_TAKEN") {
      return NextResponse.json({ error: "That URL slug is already taken. Please choose a different one." }, { status: 409 });
    }
    console.error("Failed to update listing:", err);
    return NextResponse.json({ error: "Failed to update listing", detail: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { type, id, action } = await req.json();
    const user = await getUserByEmail(session.user.email);
    const isAdmin = user?.role === "admin";

    if (action === "restore") {
      const { restoreListing } = await import("@/lib/db");
      const restored = await restoreListing(type, id, session.user.id, isAdmin);
      if (!restored) {
        return NextResponse.json({ error: "Listing not found or not authorized" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    const archived = await archiveListing(type, id, session.user.id, isAdmin);
    if (!archived) {
      return NextResponse.json({ error: "Listing not found or not authorized" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { type, id } = await req.json();
    const user = await getUserByEmail(session.user.email);
    const isAdmin = user?.role === "admin";
    const deleted = await deleteListing(type, id, session.user.id, isAdmin);
    if (!deleted) {
      return NextResponse.json({ error: "Listing not found or not authorized" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
