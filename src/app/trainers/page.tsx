import { trainers } from "@/data/sample-data";
import { PageHeader } from "@/components/ui";
import { TrainerFilters } from "./filters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Soccer Trainers & Coaches | SoccerFinder",
  description: "Find verified private soccer trainers and coaches near you. Technical skills, goalkeeper training, speed & agility, and more.",
};

export default function TrainersPage() {
  return (
    <>
      <PageHeader
        title="Private Trainers & Coaches"
        description="Find verified private trainers offering 1-on-1 and small group sessions near you."
        listingCount={trainers.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <TrainerFilters trainers={trainers} />
      </div>
    </>
  );
}
