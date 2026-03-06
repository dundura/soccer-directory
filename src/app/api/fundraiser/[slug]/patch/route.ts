import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { patchFundraiserField, getFundraiserBySlug } from "@/lib/db";

type Ctx = { params: Promise<{ slug: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);
  if (!fundraiser) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (fundraiser.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { field, value } = await req.json();
  if (typeof field !== "string" || typeof value !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const ok = await patchFundraiserField(slug, session.user.id, field, value);
  if (!ok) return NextResponse.json({ error: "Invalid field" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
