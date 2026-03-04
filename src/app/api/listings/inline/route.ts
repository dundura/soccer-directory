import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { patchListingField } from "@/lib/db";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { type, id, field, value } = await req.json();
    if (!type || !id || !field || value === undefined) {
      return NextResponse.json({ error: "Missing type, id, field, or value" }, { status: 400 });
    }

    const isAdmin = (session.user as { role?: string }).role === "admin";

    // Admin: no user_id check. Owner: patchListingField checks user_id match.
    const updated = await patchListingField(
      type, id, field, value,
      isAdmin ? undefined : session.user.id
    );

    if (!updated) {
      return NextResponse.json({ error: "Update failed or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update field" }, { status: 500 });
  }
}
