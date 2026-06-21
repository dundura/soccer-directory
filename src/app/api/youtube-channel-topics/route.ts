import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getYoutubeChannelTopics,
  createYoutubeChannelTopic,
  updateYoutubeChannelTopic,
  deleteYoutubeChannelTopic,
  createYoutubeChannelTopicVideo,
  deleteYoutubeChannelTopicVideo,
  getListingOwnerIdById,
  getUserByEmail,
} from "@/lib/db";
import { neon } from "@neondatabase/serverless";

async function isOwnerOrAdmin(userId: string, email: string | undefined, channelId: string): Promise<boolean> {
  const ownerId = await getListingOwnerIdById("youtube", channelId);
  if (ownerId === userId) return true;
  if (email) {
    const user = await getUserByEmail(email);
    if (user?.role === "admin") return true;
  }
  return false;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");
  if (!channelId) return NextResponse.json({ error: "Missing channelId" }, { status: 400 });
  const topics = await getYoutubeChannelTopics(channelId);
  return NextResponse.json({ topics });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { action, channelId, topicId, videoId, title, description, url, previewImage, slug } = body;

  if (!channelId) return NextResponse.json({ error: "Missing channelId" }, { status: 400 });

  const allowed = await isOwnerOrAdmin(session.user.id, session.user.email ?? undefined, channelId);
  if (!allowed) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  try {
    if (action === "createTopic") {
      if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
      const id = await createYoutubeChannelTopic(channelId, title, description, previewImage);
      return NextResponse.json({ id });
    }

    if (action === "updateTopic") {
      if (!topicId) return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
      await updateYoutubeChannelTopic(topicId, { title, slug, description, previewImage });
      return NextResponse.json({ success: true });
    }

    if (action === "deleteTopic") {
      if (!topicId) return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
      await deleteYoutubeChannelTopic(topicId);
      return NextResponse.json({ success: true });
    }

    if (action === "togglePin") {
      if (!topicId) return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
      const sql = neon(process.env.DATABASE_URL!);
      await sql`UPDATE youtube_channel_topics SET pinned = NOT COALESCE(pinned, false) WHERE id = ${topicId}`;
      return NextResponse.json({ success: true });
    }

    if (action === "reorder") {
      const { order } = body;
      if (!order || !Array.isArray(order)) return NextResponse.json({ error: "Missing order" }, { status: 400 });
      const sql = neon(process.env.DATABASE_URL!);
      for (const item of order) {
        await sql`UPDATE youtube_channel_topics SET sort_order = ${item.sort} WHERE id = ${item.id}`;
      }
      return NextResponse.json({ success: true });
    }

    if (action === "createVideo") {
      if (!topicId) return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
      if (!url) return NextResponse.json({ error: "Video URL required" }, { status: 400 });
      const id = await createYoutubeChannelTopicVideo(topicId, url, title, description);
      return NextResponse.json({ id });
    }

    if (action === "deleteVideo") {
      if (!videoId) return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
      await deleteYoutubeChannelTopicVideo(videoId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("YouTube channel topics API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
