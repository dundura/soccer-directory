import { NextResponse } from "next/server";
import { getTrainerBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trainer = await getTrainerBySlug(slug);
  if (!trainer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trainer);
}
