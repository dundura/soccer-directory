import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBlogPosts } from "@/lib/db";

const ADMIN_EMAILS = ["neil@anytime-soccer.com", "nmciq2@gmail.com"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const posts = await getBlogPosts();
  return NextResponse.json({ posts: posts.map(p => ({ id: p.id, slug: p.slug, title: p.title, category: p.category, date: p.date })) });
}
