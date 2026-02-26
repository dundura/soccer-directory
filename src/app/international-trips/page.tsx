import { getInternationalTrips } from "@/lib/db";
import { PageHeader, ListingCard, AnytimeInlineCTA } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "International Soccer Trips | Soccer Near Me",
  description: "Find international soccer trip opportunities for youth players. Train abroad, compete internationally, and experience soccer culture around the world.",
};

function isExpired(dateStr: string): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const yearMatch = dateStr.match(/(\d{4})/);
  if (!yearMatch) return false;
  const rangeMatch = dateStr.match(/(\w+)\s+\d+\s*[-–]\s*(\d+),?\s*(\d{4})/);
  if (rangeMatch) {
    const endDate = new Date(`${rangeMatch[1]} ${rangeMatch[2]}, ${rangeMatch[3]}`);
    if (!isNaN(endDate.getTime())) return endDate < now;
  }
  const singleMatch = dateStr.match(/(\w+\s+\d+),?\s*(\d{4})/);
  if (singleMatch) {
    const d = new Date(`${singleMatch[1]}, ${singleMatch[2]}`);
    if (!isNaN(d.getTime())) return d < now;
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed < now;
  return false;
}

export default async function InternationalTripsPage() {
  const all = await getInternationalTrips();
  const trips = all.filter((t) => !isExpired(t.dates));
  const sorted = [...trips].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      <PageHeader
        title="International Soccer Trips"
        description="Train abroad, compete internationally, and experience soccer culture around the world."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-lg">No upcoming international trips at the moment.</p>
            <p className="text-muted text-sm mt-2">Check back soon or list your own trip!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((trip) => (
              <ListingCard
                key={trip.id}
                href={`/international-trips/${trip.slug}`}
                title={trip.tripName}
                subtitle={`${trip.destination} \u00b7 ${trip.organizer}`}
                badges={[
                  { label: trip.level, variant: "blue" },
                  { label: trip.gender, variant: trip.gender === "Boys" ? "blue" : "purple" },
                  { label: trip.ageGroup },
                ]}
                details={[
                  { label: "Dates", value: trip.dates },
                  { label: "Destination", value: trip.destination },
                  ...(trip.price ? [{ label: "Price", value: trip.price }] : []),
                  ...(trip.spotsAvailable ? [{ label: "Spots Available", value: trip.spotsAvailable }] : []),
                ]}
                featured={trip.featured}
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
