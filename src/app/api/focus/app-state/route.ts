import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAppLocalState, setAppLocalState } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  const value = await getAppLocalState(key);
  return NextResponse.json({ value });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  await setAppLocalState(key, value);
  return NextResponse.json({ success: true });
}
