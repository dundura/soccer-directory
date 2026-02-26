import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGuestPostBySlug, incrementGuestPostViewCount, deleteGuestPost } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;
  try {
    const post = await getGuestPostBySlug(slug);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    await incrementGuestPostViewCount(slug);
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { slug } = await params;
  const post = await getGuestPostBySlug(slug);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  const deleted = await deleteGuestPost(post.id, session.user.id);
  if (!deleted) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  return NextResponse.json({ success: true });
}
