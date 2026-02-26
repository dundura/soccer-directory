import { Suspense } from "react";
import { getMarketplaceItems } from "@/lib/db";
import { ShopFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Equipment | Soccer Near Me",
  description: "Recommended soccer gear plus equipment and books from the community. Find everything your player needs.",
};

export default async function ShopPage() {
  const items = await getMarketplaceItems();
  return <Suspense><ShopFilters items={items} /></Suspense>;
}
