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
  const { action, podcastId, topicId, title, description, embedUrl, embedHtml, slug, previewImage, links } = body;


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

    if (action === "togglePin") {
      if (!topicId) return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL!);
      await sql`UPDATE podcast_topics SET pinned = NOT COALESCE(pinned, false) WHERE id = ${topicId}`;
      return NextResponse.json({ success: true });
    }

    if (action === "reorder") {
      const { order } = body;
      if (!order || !Array.isArray(order)) return NextResponse.json({ error: "Missing order" }, { status: 400 });
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL!);
      for (const item of order) {
        await sql`UPDATE podcast_topics SET sort_order = ${item.sort} WHERE id = ${item.id}`;
      }
      return NextResponse.json({ success: true });
    }

    if (action === "createEpisode") {
      if (!topicId) return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
      if (!embedUrl && !embedHtml) return NextResponse.json({ error: "Embed URL or HTML required" }, { status: 400 });
      const id = await createPodcastEpisode(topicId, { title, description, slug, previewImage, embedUrl, embedHtml, links });
      return NextResponse.json({ id });
    }

    if (action === "updateEpisode") {
      const { episodeId } = body;
      if (!episodeId) return NextResponse.json({ error: "Missing episodeId" }, { status: 400 });
      await updatePodcastEpisode(episodeId, {
        title, description, slug, previewImage, links,
        embedUrl: body.embedUrl ?? null,
        embedHtml: body.embedHtml ?? null,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "deleteEpisode") {
      const { episodeId } = body;
      if (!episodeId) return NextResponse.json({ error: "Missing episodeId" }, { status: 400 });
      await deletePodcastEpisode(episodeId);
      return NextResponse.json({ success: true });
    }

    if (action === "swapEpisodeOrder") {
      const { episodeId1, episodeId2 } = body;
      if (!episodeId1 || !episodeId2) return NextResponse.json({ error: "Missing episode IDs" }, { status: 400 });
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL!);
      // Fetch all episodes in this topic to establish full order
      const ep1Row = await sql`SELECT topic_id FROM podcast_episodes WHERE id = ${episodeId1} LIMIT 1`;
      if (!ep1Row[0]) return NextResponse.json({ error: "Episode not found" }, { status: 404 });
      const allRows = await sql`SELECT id FROM podcast_episodes WHERE topic_id = ${ep1Row[0].topic_id} ORDER BY COALESCE(sort_order, 999999) ASC, created_at DESC`;
      // Assign consecutive sort_orders (0-based), then swap the two
      const ids = allRows.map((r: Record<string, any>) => r.id as string);
      const orderMap: Record<string, number> = {};
      ids.forEach((id: string, i: number) => { orderMap[id] = i; });
      const o1 = orderMap[episodeId1];
      const o2 = orderMap[episodeId2];
      // Persist full sort_order assignments then swap
      for (const [id, order] of Object.entries(orderMap) as [string, number][]) {
        await sql`UPDATE podcast_episodes SET sort_order = ${order} WHERE id = ${id}`;
      }
      await sql`UPDATE podcast_episodes SET sort_order = ${o2} WHERE id = ${episodeId1}`;
      await sql`UPDATE podcast_episodes SET sort_order = ${o1} WHERE id = ${episodeId2}`;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Podcast topics API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
