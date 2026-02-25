import { Suspense } from "react";
import { getTeams } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { TeamFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Youth Soccer Teams | SoccerFinder",
  description: "Find youth soccer teams looking for players. Browse by age group, level, gender, and location.",
};

export default async function TeamsPage() {
  const teams = await getTeams();
  return (
    <>
      <PageHeader
        title="Youth Soccer Teams"
        description="Find teams looking for players. Filter by age group, competitive level, and location."
        listingCount={teams.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense><TeamFilters teams={teams} /></Suspense>
      </div>
    </>
  );
}
