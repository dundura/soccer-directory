import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createFundraiser } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const data = await req.json();
  if (!data.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const slug = data.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (slug && (slug.length < 3 || slug.length > 60)) {
    return NextResponse.json({ error: "Slug must be 3-60 characters" }, { status: 400 });
  }
  try {
    const finalSlug = await createFundraiser({ ...data, slug: slug || undefined }, session.user.id);
    return NextResponse.json({ success: true, slug: finalSlug });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "That URL slug is already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
