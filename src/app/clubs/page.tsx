import { Suspense } from "react";
import { clubs } from "@/data/sample-data";
import { PageHeader, ListingCard } from "@/components/ui";
import { ClubFilters } from "./filters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Youth Soccer Clubs | SoccerFinder",
  description: "Find youth soccer clubs near you. Browse verified clubs across ECNL, MLS Next, GA, and recreational leagues.",
};

export default function ClubsPage() {
  return (
    <>
      <PageHeader
        title="Youth Soccer Clubs"
        description="Browse verified clubs across ECNL, MLS Next, GA, recreational leagues, and more."
        listingCount={clubs.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense><ClubFilters clubs={clubs} /></Suspense>
      </div>
    </>
  );
}
