import { Suspense } from "react";
import { getTournaments } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { TournamentFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Tournaments | SoccerFinder",
  description: "Find youth soccer tournaments near you. Browse by level, age group, format, and location.",
};

export default async function TournamentsPage() {
  const tournaments = await getTournaments();
  return (
    <>
      <PageHeader
        title="Soccer Tournaments"
        description="Find tournaments from local recreational events to elite national showcases."
        listingCount={tournaments.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense><TournamentFilters tournaments={tournaments} /></Suspense>
      </div>
    </>
  );
}
