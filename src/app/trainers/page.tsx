import { Suspense } from "react";
import { getTrainers } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { TrainerFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Soccer Trainers & Coaches | SoccerFinder",
  description: "Find verified private soccer trainers and coaches near you. Technical skills, goalkeeper training, speed & agility, and more.",
};

export default async function TrainersPage() {
  const trainers = await getTrainers();
  return (
    <>
      <PageHeader
        title="Private Trainers & Coaches"
        description="Find verified private trainers offering 1-on-1 and small group sessions near you."
        listingCount={trainers.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense><TrainerFilters trainers={trainers} /></Suspense>
      </div>
    </>
  );
}
