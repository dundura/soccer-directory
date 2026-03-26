import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPodcastTopics,
  createPodcastTopic,
  updatePodcastTopic,
  deletePodcastTopic,
  createPodcastEpisode,
  updatePodcastEpisode,
  deletePodcastEpisode,
  getListingOwnerIdById,
  getUserByEmail,
} from "@/lib/db";

async function isOwnerOrAdmin(userId: string, email: string | undefined, podcastId: string): Promise<boolean> {
  const ownerId = await getListingOwnerIdById("podcast", podcastId);
  if (ownerId === userId) return true;
  if (email) {
    const user = await getUserByEmail(email);
    if (user?.role === "admin") return true;
  }
  return false;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const podcastId = searchParams.get("podcastId");
  if (!podcastId) return NextResponse.json({ error: "Missing podcastId" }, { status: 400 });
  const topics = await getPodcastTopics(podcastId);
  return NextResponse.json({ topics });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { action, podcastId, topicId, title, description, embedUrl, embedHtml, slug, previewImage } = body;

  if (!podcastId) return NextResponse.json({ error: "Missing podcastId" }, { status: 400 });

  const allowed = await isOwnerOrAdmin(session.user.id, session.user.email ?? undefined, podcastId);
  if (!allowed) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  try {
    if (action === "createTopic") {
      if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
      const id = await createPodcastTopic(podcastId, title, description, previewImage);
      return NextResponse.json({ id });
    }

    if (action === "updateTopic") {
      if (!topicId) return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
      await updatePodcastTopic(topicId, { title, slug, description, previewImage });
      return NextResponse.json({ success: true });
    }

    if (action === "deleteTopic") {
      if (!topicId) return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
      await deletePodcastTopic(topicId);
      return NextResponse.json({ success: true });
    }

    if (action === "createEpisode") {
      if (!topicId) return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
      if (!embedUrl && !embedHtml) return NextResponse.json({ error: "Embed URL or HTML required" }, { status: 400 });
      const id = await createPodcastEpisode(topicId, { title, description, embedUrl, embedHtml });
      return NextResponse.json({ id });
    }

    if (action === "updateEpisode") {
      const { episodeId } = body;
      if (!episodeId) return NextResponse.json({ error: "Missing episodeId" }, { status: 400 });
      await updatePodcastEpisode(episodeId, { title, description, embedUrl, embedHtml });
      return NextResponse.json({ success: true });
    }

    if (action === "deleteEpisode") {
      const { episodeId } = body;
      if (!episodeId) return NextResponse.json({ error: "Missing episodeId" }, { status: 400 });
      await deletePodcastEpisode(episodeId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Podcast topics API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
