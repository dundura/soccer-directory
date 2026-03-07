import { Suspense } from "react";
import { getScrimmages } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { ScrimmageFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find Scrimmages | Soccer Near Me",
  description: "Find teams looking for scrimmages in your area. Post your team or find opponents by age group, level, and location.",
};

export default async function ScrimmagesPage() {
  const scrimmages = await getScrimmages();
  return (
    <>
      <PageHeader
        title="Find Scrimmages"
        description="Find teams looking for scrimmages in your area. Post your availability or find opponents."
        listingCount={scrimmages.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense><ScrimmageFilters scrimmages={scrimmages} /></Suspense>
      </div>
    </>
  );
}
