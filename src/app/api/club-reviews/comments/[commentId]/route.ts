import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteClubReviewComment } from "@/lib/db";

type Props = { params: Promise<{ commentId: string }> };

export async function DELETE(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { commentId } = await params;
  const deleted = await deleteClubReviewComment(commentId, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: "Comment not found or not yours" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
