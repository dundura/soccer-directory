import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFundraiserBySlug, getDonationsByFundraiserId, updateFundraiser, deleteFundraiser } from "@/lib/db";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);
  if (!fundraiser) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const donations = await getDonationsByFundraiserId(fundraiser.id);
  return NextResponse.json({ fundraiser, donations });
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { slug } = await params;
  const data = await req.json();
  const ok = await updateFundraiser(slug, data, session.user.id);
  if (!ok) return NextResponse.json({ error: "Not found or not owner" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { slug } = await params;
  const ok = await deleteFundraiser(slug, session.user.id);
  if (!ok) return NextResponse.json({ error: "Not found or not owner" }, { status: 404 });
  return NextResponse.json({ success: true });
}
