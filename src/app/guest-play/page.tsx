import { getGuestOpportunities } from "@/lib/db";
import { PageHeader, ListingCard, AnytimeInlineCTA } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guest Player Opportunities | SoccerFinder",
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
  const sorted = [...guestOpportunities].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      <PageHeader
        title="Guest Player Opportunities"
        description="Find short-term playing opportunities for tournaments and showcases. Great exposure without switching clubs."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-lg">No upcoming guest player opportunities at the moment.</p>
            <p className="text-muted text-sm mt-2">Check back soon or list your own opportunity!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((opp) => (
              <ListingCard
                key={opp.id}
                href={`/guest-play/${opp.slug}`}
                title={opp.teamName}
                subtitle={`${opp.tournament} \u00b7 ${opp.city}, ${opp.state}`}
                badges={[
                  { label: opp.level, variant: "blue" },
                  { label: opp.gender, variant: opp.gender === "Boys" ? "blue" : "purple" },
                  { label: opp.ageGroup },
                ]}
                details={[
                  { label: "Dates", value: opp.dates },
                  { label: "Tournament", value: opp.tournament },
                  { label: "Positions Needed", value: opp.positionsNeeded },
                ]}
                featured={opp.featured}
                cta="View Details"
              />
            ))}
          </div>
        )}
        <div className="mt-12"><AnytimeInlineCTA /></div>
      </div>
    </>
  );
}
