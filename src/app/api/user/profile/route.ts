import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUserProfile, deleteUserAccount, getUserByEmail } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Check if email is already taken by another user
    const existing = await getUserByEmail(email);
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "This email is already in use" }, { status: 409 });
    }

    await updateUserProfile(session.user.id, name, email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteUserAccount(session.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
