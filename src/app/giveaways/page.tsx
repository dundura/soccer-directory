import { Suspense } from "react";
import { getGiveaways } from "@/lib/db";
import { GiveawayFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free Giveaways | Soccer Near Me",
  description: "Browse free soccer giveaways from the community. Equipment, gear, and more.",
};

export default async function GiveawaysPage() {
  const giveaways = await getGiveaways();
  return <Suspense><GiveawayFilters items={giveaways} /></Suspense>;
}
