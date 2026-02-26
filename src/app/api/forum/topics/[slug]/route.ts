import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getForumTopicBySlug, incrementTopicViewCount, deleteForumTopic } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  try {
    const topic = await getForumTopicBySlug(slug);
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    await incrementTopicViewCount(slug);
    return NextResponse.json(topic);
  } catch {
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { slug } = await params;
  const topic = await getForumTopicBySlug(slug);
  if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  const deleted = await deleteForumTopic(topic.id, session.user.id);
  if (!deleted) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  return NextResponse.json({ success: true });
}
