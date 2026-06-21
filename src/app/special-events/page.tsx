import { Suspense } from "react";
import { getSpecialEvents } from "@/lib/db";
import { SpecialEventFilters } from "./filters";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Soccer Events Near Me | Soccer Near Me",
  description: "Find upcoming soccer events near you. Clinics, festivals, skills challenges, fundraisers, and more for all ages.",
};

export default async function SpecialEventsPage() {
  const events = await getSpecialEvents();
  return <Suspense><SpecialEventFilters events={events} /></Suspense>;
}
