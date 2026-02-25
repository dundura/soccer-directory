import { Suspense } from "react";
import { getFutsalTeams } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { FutsalFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Futsal Teams | Soccer Near Me",
  description: "Find futsal teams looking for players. Browse by age group, level, gender, and location.",
};

export default async function FutsalPage() {
  const teams = await getFutsalTeams();
  return (
    <>
      <PageHeader
        title="Futsal Teams"
        description="Find futsal teams looking for players. Filter by age group, level, and location."
        listingCount={teams.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense><FutsalFilters teams={teams} /></Suspense>
      </div>
    </>
  );
}
