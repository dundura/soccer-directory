import { NextResponse } from "next/server";
import { getCampBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const camp = await getCampBySlug(slug);
  if (!camp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(camp);
}
