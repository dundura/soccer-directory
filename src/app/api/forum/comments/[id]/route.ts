import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteForumComment } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const deleted = await deleteForumComment(id, session.user.id);
  if (!deleted) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  return NextResponse.json({ success: true });
}
