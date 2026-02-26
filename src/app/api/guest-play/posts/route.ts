import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import { createGuestPost, getGuestPosts } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const NOTIFY_EMAIL = "neil@anytime-soccer.com";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const posts = await getGuestPosts(category);
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { title, category, body } = await req.json();
    if (!title || !category || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = await createGuestPost(title, category, body, session.user.id);

    if (resend) {
      await resend.emails.send({
        from: "Soccer Near Me <notifications@soccer-near-me.com>",
        to: NOTIFY_EMAIL,
        subject: `New Guest Player Post: ${title}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;">
            <h2 style="color:#1a365d;">New Guest Player Post</h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px 0;color:#666;width:100px;">Title</td><td style="padding:8px 0;font-weight:bold;">${title}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Category</td><td style="padding:8px 0;">${category}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Author</td><td style="padding:8px 0;">${session.user.name}</td></tr>
            </table>
            <div style="background:#f7f7f7;padding:16px;border-radius:8px;margin:16px 0;">
              <p style="color:#333;line-height:1.6;margin:0;">${body.substring(0, 500)}</p>
            </div>
            <a href="https://www.soccer-near-me.com/guest-play/posts/${slug}" style="display:inline-block;padding:12px 24px;background:#DC373E;color:white;text-decoration:none;border-radius:8px;">View Post</a>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, slug });
  } catch {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
