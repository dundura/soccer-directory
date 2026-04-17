import { Suspense } from "react";
import { getConsultants } from "@/lib/db";
import { ConsultantFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Performance Consultants | Soccer Near Me",
  description: "Find expert soccer performance consultants specializing in biomechanics, injury prevention, sports science, and athlete development for elite soccer players.",
};

export default async function ConsultantsPage() {
  const consultants = await getConsultants();
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 pb-16">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold text-primary uppercase tracking-tight">
          Performance Consultants
        </h1>
        <p className="text-muted text-sm mt-2 max-w-2xl">
          Expert soccer specialists in biomechanics, sports science, injury prevention, and elite athlete development.
        </p>
      </div>
      <Suspense>
        <ConsultantFilters consultants={consultants as Parameters<typeof ConsultantFilters>[0]["consultants"]} />
      </Suspense>
    </div>
  );
}
