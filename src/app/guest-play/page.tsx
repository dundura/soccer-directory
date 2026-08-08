import { Suspense } from "react";
import { getGuestOpportunities } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { GuestPlayFilters } from "./filters";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Guest Player Opportunities | Soccer Near Me",
  description: "Find guest player opportunities for tournaments and showcases. Get exposure without switching clubs.",
};

function isExpired(dateStr: string): boolean {
  // Try to extract a date from common formats like "June 15-18, 2026", "March 15, 2026", "03/15/2026"
  // We look for the last date-like portion and check if it's in the past
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Try to find a year in the string
  const yearMatch = dateStr.match(/(\d{4})/);
  if (!yearMatch) return false;

  // Try to parse the last meaningful date component
  // For ranges like "June 15-18, 2026", we want the end date (June 18, 2026)
  const rangeMatch = dateStr.match(/(\w+)\s+\d+\s*[-–]\s*(\d+),?\s*(\d{4})/);
  if (rangeMatch) {
    const endDate = new Date(`${rangeMatch[1]} ${rangeMatch[2]}, ${rangeMatch[3]}`);
    if (!isNaN(endDate.getTime())) return endDate < now;
  }

  // For single dates like "March 15, 2026"
  const singleMatch = dateStr.match(/(\w+\s+\d+),?\s*(\d{4})/);
  if (singleMatch) {
    const d = new Date(`${singleMatch[1]}, ${singleMatch[2]}`);
    if (!isNaN(d.getTime())) return d < now;
  }

  // For dates like "03/15/2026" or "2026-03-15"
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed < now;

  return false;
}

export default async function GuestPlayPage() {
  const all = await getGuestOpportunities();
  // Filter out expired opportunities
  const guestOpportunities = all.filter((opp) => !isExpired(opp.dates));

  return (
    <>
      <PageHeader
        title="Guest Player Opportunities"
        description="Find short-term playing opportunities for tournaments and showcases. Great exposure without switching clubs."
      />
      <Suspense>
        <GuestPlayFilters opportunities={guestOpportunities} />
      </Suspense>
    </>
  );
}
