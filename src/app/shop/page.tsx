import { Suspense } from "react";
import { getMarketplaceItems } from "@/lib/db";
import { ShopFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Equipment & Books | Soccer Near Me",
  description: "Buy and sell soccer equipment, books, and gear. Find great deals from the soccer community.",
};

export default async function ShopPage() {
  const items = await getMarketplaceItems();
  return <Suspense><ShopFilters items={items} /></Suspense>;
}
