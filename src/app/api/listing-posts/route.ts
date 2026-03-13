import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getListingPosts, createListingPost, deleteListingPost, toggleListingPostHidden, getListingOwner, getListingNameById } from "@/lib/db";
import { notifyNewPost } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["club", "team", "trainer", "recruiter", "futsal", "camp", "specialevent", "tryout", "tournament", "player", "blog", "fbgroup", "instagrampage", "tiktokpage", "podcast", "youtube", "service", "trainingapp", "ebook", "giveaway", "guest", "trip", "marketplace", "fundraiser"];

function isAdmin(session: { user?: { role?: string } } | null): boolean {
  return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");
  if (!type || !id || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Missing type/id" }, { status: 400 });
  }

  try {
    const session = await auth();
    let includeHidden = false;
    if (session?.user?.id && slug) {
      if (isAdmin(session)) {
        includeHidden = true;
      } else {
        const ownerId = await getListingOwner(type, slug);
        includeHidden = ownerId === session.user.id;
      }
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
    const { type, id, slug, body, imageUrl, videoUrl, ctaUrl, ctaLabel, ogImageUrl, title } = await req.json();
    if (!type || !id || !slug || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!body?.trim()) {
      return NextResponse.json({ error: "Post body is required" }, { status: 400 });
    }

    if (!isAdmin(session)) {
      const ownerId = await getListingOwner(type, slug);
      if (ownerId !== session.user.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }
    }

    // Auto-fetch TikTok thumbnail for OG preview if no preview image provided
    let finalOgImageUrl = ogImageUrl || undefined;
    if (!finalOgImageUrl && !imageUrl && videoUrl) {
      const tiktokMatch = videoUrl.match(/tiktok\.com/);
      if (tiktokMatch) {
        try {
          const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`);
          if (oembedRes.ok) {
            const oembedData = await oembedRes.json();
            if (oembedData.thumbnail_url) finalOgImageUrl = oembedData.thumbnail_url;
          }
        } catch { /* ignore — will just have no thumbnail */ }
      }
    }

    const post = await createListingPost(type, id, session.user.id, body.trim(), imageUrl || undefined, videoUrl || undefined, ctaUrl || undefined, ctaLabel || undefined, finalOgImageUrl, title?.trim() || undefined);

    // Send notification email (fire and forget)
    const listingName = await getListingNameById(type, id).catch(() => null);
    const postUrl = `https://www.soccer-near-me.com/posts/${post.slug || post.id}`;
    notifyNewPost(type, listingName || "Unknown Listing", (session.user as { name?: string }).name || "Unknown", title?.trim() || undefined, postUrl).catch(() => {});

    return NextResponse.json({ success: true, id: post.id, slug: post.slug });
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
    // Admins can delete any post; owners can only delete their own
    if (isAdmin(session)) {
      // Admin bypass: delete regardless of user_id
      const { deleteListingPostAdmin } = await import("@/lib/db");
      const deleted = await deleteListingPostAdmin(id);
      if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    } else {
      const deleted = await deleteListingPost(id, session.user.id);
      if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
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
    const { id, action, body, slug, imageUrl, videoUrl, ctaUrl, ctaLabel, ctaUrl2, ctaLabel2, ctaUrl3, ctaLabel3, ogImageUrl, title } = await req.json();
    if (action === "toggle_hidden") {
      if (isAdmin(session)) {
        const { toggleListingPostHiddenAdmin } = await import("@/lib/db");
        const toggled = await toggleListingPostHiddenAdmin(id);
        if (!toggled) return NextResponse.json({ error: "Not found" }, { status: 404 });
      } else {
        const toggled = await toggleListingPostHidden(id, session.user.id);
        if (!toggled) return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }
    if (action === "edit_body" && typeof body === "string") {
      if (isAdmin(session)) {
        const { updateListingPostBodyAdmin } = await import("@/lib/db");
        const ok = await updateListingPostBodyAdmin(id, body, title || undefined);
        if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      } else {
        const { updateListingPostBody } = await import("@/lib/db");
        const ok = await updateListingPostBody(id, session.user.id, body, title || undefined);
        if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }
    if (action === "edit_slug" && typeof slug === "string") {
      if (isAdmin(session)) {
        const { updateListingPostSlugAdmin } = await import("@/lib/db");
        const ok = await updateListingPostSlugAdmin(id, slug);
        if (!ok) return NextResponse.json({ error: "Slug taken or invalid" }, { status: 400 });
      } else {
        const { updateListingPostSlug } = await import("@/lib/db");
        const ok = await updateListingPostSlug(id, session.user.id, slug);
        if (!ok) return NextResponse.json({ error: "Slug taken or invalid" }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }
    if (action === "edit_media") {
      const { updateListingPostMedia, updateListingPostMediaAdmin } = await import("@/lib/db");
      const ok = isAdmin(session)
        ? await updateListingPostMediaAdmin(id, imageUrl ?? null, videoUrl ?? null, ctaUrl ?? null, ctaLabel ?? null, ogImageUrl ?? null, ctaUrl2 ?? null, ctaLabel2 ?? null, ctaUrl3 ?? null, ctaLabel3 ?? null)
        : await updateListingPostMedia(id, session.user.id, imageUrl ?? null, videoUrl ?? null, ctaUrl ?? null, ctaLabel ?? null, ogImageUrl ?? null, ctaUrl2 ?? null, ctaLabel2 ?? null, ctaUrl3 ?? null, ctaLabel3 ?? null);
      if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
