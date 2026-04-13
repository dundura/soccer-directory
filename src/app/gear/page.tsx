import { Suspense } from "react";
import { getGearItems } from "@/lib/db";
import { GearFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Gear | Soccer Near Me",
  description: "Find soccer gear for players of all ages. Browse equipment listings from the community.",
};

export default async function GearPage() {
  const items = await getGearItems();
  return <Suspense><GearFilters items={items} /></Suspense>;
}
