import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getListingPosts, createListingPost, deleteListingPost, toggleListingPostHidden, getListingOwner } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["club", "team", "trainer", "recruiter", "futsal"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");
  if (!type || !id || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Missing type/id" }, { status: 400 });
  }

  try {
    // Check if requester is the owner (to show hidden posts)
    const session = await auth();
    let includeHidden = false;
    if (session?.user?.id && slug) {
      const ownerId = await getListingOwner(type, slug);
      includeHidden = ownerId === session.user.id;
    }
    const posts = await getListingPosts(type, id, includeHidden);
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { type, id, slug, body, imageUrl, videoUrl } = await req.json();
    if (!type || !id || !slug || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!body?.trim()) {
      return NextResponse.json({ error: "Post body is required" }, { status: 400 });
    }

    const ownerId = await getListingOwner(type, slug);
    if (ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const postId = await createListingPost(type, id, session.user.id, body.trim(), imageUrl || undefined, videoUrl || undefined);
    return NextResponse.json({ success: true, id: postId });
  } catch {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    const deleted = await deleteListingPost(id, session.user.id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id, action } = await req.json();
    if (action === "toggle_hidden") {
      const toggled = await toggleListingPostHidden(id, session.user.id);
      if (!toggled) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
