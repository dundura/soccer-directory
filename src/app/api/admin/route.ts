import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getAllUsers, getAllListings, updateUserRole, updateListingStatus, updateListingFeatured, deleteUserAccount, getListingDataAdmin, updateListingAdmin, getSetting, updateSetting, getListingOwnerEmailById } from "@/lib/db";
import { notifyListingFeatured } from "@/lib/notifications";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(req: Request) {
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

  const [users, listings, heroTagline] = await Promise.all([getAllUsers(), getAllListings(), getSetting("hero_tagline")]);
  return NextResponse.json({ users, listings, heroTagline });
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { action, ...data } = await req.json();

    switch (action) {
      case "updateRole":
        await updateUserRole(data.userId, data.role);
        break;
      case "updateStatus":
        await updateListingStatus(data.type, data.id, data.status);
        break;
      case "updateFeatured":
        await updateListingFeatured(data.type, data.id, data.featured);
        if (data.featured && data.name && data.slug) {
          const ownerEmail = await getListingOwnerEmailById(data.type, data.id);
          if (ownerEmail) {
            notifyListingFeatured(data.type, data.name, data.slug, ownerEmail).catch(() => {});
          }
        }
        break;
      case "updateListing":
        const updated = await updateListingAdmin(data.type, data.id, data.data);
        if (!updated) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        break;
      case "deleteUser":
        await deleteUserAccount(data.userId);
        break;
      case "updateSetting":
        if (typeof data.key !== "string" || typeof data.value !== "string") return NextResponse.json({ error: "Invalid" }, { status: 400 });
        if (data.value.length > 120) return NextResponse.json({ error: "Character limit is 120" }, { status: 400 });
        await updateSetting(data.key, data.value);
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin PUT error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save" }, { status: 500 });
  }
}
