import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createForumComment } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { topicId, body } = await req.json();
    if (!topicId || !body) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    const commentId = await createForumComment(topicId, body, session.user.id);
    return NextResponse.json({ success: true, id: commentId, userName: session.user.name });
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
