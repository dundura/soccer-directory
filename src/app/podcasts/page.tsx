import { Suspense } from "react";
import { getPodcasts } from "@/lib/db";
import { PodcastFilters } from "./filters";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Soccer Podcasts | Soccer Near Me",
  description: "Discover soccer podcasts covering youth development, coaching, player development, college recruiting, and more.",
};

export default async function PodcastsPage() {
  const podcasts = await getPodcasts();
  return <Suspense><PodcastFilters podcasts={podcasts} /></Suspense>;
}
