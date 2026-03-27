import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBookMediaAppearances, createBookMediaAppearance, updateBookMediaAppearance, deleteBookMediaAppearance, getListingOwnerIdById, getUserByEmail } from "@/lib/db";

async function isOwnerOrAdmin(userId: string, email: string | undefined, bookId: string): Promise<boolean> {
  const ownerId = await getListingOwnerIdById("soccerbook", bookId);
  if (ownerId === userId) return true;
  if (email) { const user = await getUserByEmail(email); if (user?.role === "admin") return true; }
  return false;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
  const appearances = await getBookMediaAppearances(bookId);
  return NextResponse.json({ appearances });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const body = await req.json();
  const { action, bookId, appearanceId, title, slug, description, url, previewImage } = body;
  if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
  const allowed = await isOwnerOrAdmin(session.user.id, session.user.email ?? undefined, bookId);
  if (!allowed) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  try {
    if (action === "create") {
      if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
      const id = await createBookMediaAppearance(bookId, { title, description, url, previewImage });
      return NextResponse.json({ id });
    }
    if (action === "update") {
      if (!appearanceId) return NextResponse.json({ error: "Missing appearanceId" }, { status: 400 });
      await updateBookMediaAppearance(appearanceId, { title, slug, description, url, previewImage });
      return NextResponse.json({ success: true });
    }
    if (action === "delete") {
      if (!appearanceId) return NextResponse.json({ error: "Missing appearanceId" }, { status: 400 });
      await deleteBookMediaAppearance(appearanceId);
      return NextResponse.json({ success: true });
    }
    if (action === "togglePin") {
      if (!appearanceId) return NextResponse.json({ error: "Missing appearanceId" }, { status: 400 });
      const { neon } = await import("@neondatabase/serverless");
      const sql2 = neon(process.env.DATABASE_URL!);
      await sql2`UPDATE book_media_appearances SET pinned = NOT COALESCE(pinned, false) WHERE id = ${appearanceId}`;
      return NextResponse.json({ success: true });
    }
    if (action === "reorder") {
      const { order } = body;
      if (!order || !Array.isArray(order)) return NextResponse.json({ error: "Missing order" }, { status: 400 });
      const { neon } = await import("@neondatabase/serverless");
      const sql2 = neon(process.env.DATABASE_URL!);
      for (const item of order) { await sql2`UPDATE book_media_appearances SET sort_order = ${item.sort} WHERE id = ${item.id}`; }
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Book media API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
