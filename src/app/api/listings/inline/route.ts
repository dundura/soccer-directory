import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { patchListingField, getListingSlugById } from "@/lib/db";
import { getListingPath } from "@/lib/utils";

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

    // Show the edit on the public page right away instead of after the hourly refresh.
    try {
      const slug = await getListingSlugById(type, id);
      if (slug) revalidatePath(getListingPath(type, slug));
    } catch {}

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update field" }, { status: 500 });
  }
}
