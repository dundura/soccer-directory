import { NextResponse } from "next/server";
import { getMarketplaceItems } from "@/lib/db";

export async function GET() {
  const items = await getMarketplaceItems();
  return NextResponse.json(items);
}
