import { Suspense } from "react";
import { getTeams } from "@/lib/db";
import { TeamFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Youth Soccer Teams | SoccerFinder",
  description: "Find youth soccer teams looking for players. Browse by age group, level, gender, and location.",
};

export default async function TeamsPage() {
  const teams = await getTeams();
  return <Suspense><TeamFilters teams={teams} /></Suspense>;
}
