import { Suspense } from "react";
import { getTrainingApps } from "@/lib/db";
import { TrainingAppFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Training Apps | Soccer Near Me",
  description: "Discover soccer training apps for players, coaches, and families. Improve your game with the best tools available.",
};

export default async function TrainingAppsPage() {
  const apps = await getTrainingApps();
  return <Suspense><TrainingAppFilters apps={apps} /></Suspense>;
}
