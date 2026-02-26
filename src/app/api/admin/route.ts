import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getAllUsers, getAllListings, updateUserRole, updateListingStatus, updateListingFeatured, deleteUserAccount } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [users, listings] = await Promise.all([getAllUsers(), getAllListings()]);
  return NextResponse.json({ users, listings });
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
      break;
    case "deleteUser":
      await deleteUserAccount(data.userId);
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
