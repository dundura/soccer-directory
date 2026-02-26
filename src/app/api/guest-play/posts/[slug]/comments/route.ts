import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createGuestPostComment, getGuestPostComments } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    const comments = await getGuestPostComments(postId);
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { postId, body } = await req.json();
    if (!postId || !body) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    const commentId = await createGuestPostComment(postId, body, session.user.id);
    return NextResponse.json({ success: true, id: commentId, userName: session.user.name });
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
