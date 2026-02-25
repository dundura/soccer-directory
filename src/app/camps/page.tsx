import { camps } from "@/data/sample-data";
import { PageHeader } from "@/components/ui";
import { CampFilters } from "./filters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soccer Camps & Clinics | SoccerFinder",
  description: "Find soccer camps, clinics, ID camps, and college showcases near you. Register for summer 2026 programs now.",
};

export default function CampsPage() {
  return (
    <>
      <PageHeader
        title="Soccer Camps & Clinics"
        description="Find the perfect camp — from elite ID camps and college showcases to fun recreational programs."
        listingCount={camps.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <CampFilters camps={camps} />
      </div>
    </>
  );
}
