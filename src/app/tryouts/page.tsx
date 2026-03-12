import { Suspense } from "react";
import { getTryouts, getClubs, getTeams } from "@/lib/db";
import { TryoutFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Tryouts Near Me | Soccer Near Me",
  description: "Find upcoming soccer tryouts for clubs and teams near you. Open tryouts, ID sessions, and combines for all ages.",
};

export default async function TryoutsPage() {
  const [tryouts, clubs, teams] = await Promise.all([getTryouts(), getClubs(), getTeams()]);
  return <Suspense><TryoutFilters tryouts={tryouts} clubs={clubs} teams={teams} /></Suspense>;
}
