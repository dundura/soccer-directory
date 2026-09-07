import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getAllUsers, getAllListings, updateUserRole, updateListingStatus, updateListingFeatured, deleteUserAccount, getListingDataAdmin, updateListingAdmin, getSetting, updateSetting, getListingOwnerEmailById, getListingOwnerById, getAllClubReviewComments, adminDeleteClubReviewComment, hasListingEmail, recordListingEmail, getListingEmailSteps } from "@/lib/db";
import { notifyListingFeatured, notifyListingWelcome } from "@/lib/notifications";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    // Return single listing data for admin editing
    if (type && id) {
      const data = await getListingDataAdmin(type, id);
      if (!data) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      return NextResponse.json(data);
    }

    const [users, listings, heroTagline, clubReviewComments, emailSteps] = await Promise.all([getAllUsers(), getAllListings(), getSetting("hero_tagline"), getAllClubReviewComments(), getListingEmailSteps()]);
    return NextResponse.json({ users, listings, heroTagline, clubReviewComments, emailSteps });
  } catch (err) {
    console.error("Admin GET error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load" }, { status: 500 });
  }
}

/**
 * Send a listing owner their welcome, once.
 *
 * The guard is a row in listing_emails rather than a flag on the listing: the
 * same table has to carry every later step in the sequence, and six listing
 * tables do not each want a column per email.
 */
async function sendListingWelcome(type: string, id: string): Promise<{ ok: boolean; error?: string }> {
  if (!type || !id) return { ok: false, error: "Missing listing" };
  if (await hasListingEmail(type, id, "welcome")) {
    return { ok: false, error: "They have already had the welcome." };
  }
  const owner = await getListingOwnerById(type, id);
  if (!owner) return { ok: false, error: "No account email for that listing." };

  const listing = await getListingDataAdmin(type, id);
  const name = (listing?.name as string) || (listing?.title as string) || "Your listing";
  const slug = (listing?.slug as string) || "";

  const sent = await notifyListingWelcome(type, name, slug, owner);
  if (!sent) return { ok: false, error: "The email did not send." };

  await recordListingEmail(type, id, "welcome", owner.email);
  return { ok: true };
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { action, ...data } = await req.json();

    switch (action) {
      case "updateRole":
        await updateUserRole(data.userId, data.role);
        break;
      case "updateStatus":
        await updateListingStatus(data.type, data.id, data.status);
        // Approving one is also the moment its owner should hear from us.
        if (data.status === "approved") {
          await sendListingWelcome(data.type, data.id).catch(() => {});
        }
        break;
      case "sendWelcome": {
        const result = await sendListingWelcome(data.type, data.id);
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
        break;
      }
      case "updateFeatured":
        await updateListingFeatured(data.type, data.id, data.featured);
        if (data.featured && data.name && data.slug) {
          const ownerEmail = await getListingOwnerEmailById(data.type, data.id);
          if (ownerEmail) {
            notifyListingFeatured(data.type, data.name, data.slug, ownerEmail).catch(() => {});
          }
        }
        break;
      case "updateListing": {
        const updated = await updateListingAdmin(data.type, data.id, data.data);
        if (!updated) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        break;
      }
      case "deleteUser":
        await deleteUserAccount(data.userId);
        break;
      case "deleteClubReviewComment":
        await adminDeleteClubReviewComment(data.commentId);
        break;
      case "updateSetting":
        if (typeof data.key !== "string" || typeof data.value !== "string") return NextResponse.json({ error: "Invalid" }, { status: 400 });
        if (data.value.length > 120) return NextResponse.json({ error: "Character limit is 120" }, { status: 400 });
        await updateSetting(data.key, data.value);
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const { getListingSlugById } = await import("@/lib/db");
    const slug = data.type && data.id ? await getListingSlugById(data.type, data.id) || data.id : data.id;
    return NextResponse.json({ success: true, slug, type: data.type });
  } catch (err) {
    if (err instanceof Error && err.message === "SLUG_TAKEN") {
      return NextResponse.json({ error: "That URL slug is already taken. Please choose a different one." }, { status: 409 });
    }
    console.error("Admin PUT error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save" }, { status: 500 });
  }
}
