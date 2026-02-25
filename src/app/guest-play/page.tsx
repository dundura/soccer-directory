import { getGuestOpportunities } from "@/lib/db";
import { PageHeader, ListingCard, AnytimeInlineCTA } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guest Player Opportunities | SoccerFinder",
  description: "Find guest player opportunities for tournaments and showcases. Get exposure without switching clubs.",
};

export default async function GuestPlayPage() {
  const guestOpportunities = await getGuestOpportunities();
  const sorted = [...guestOpportunities].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <>
      <PageHeader
        title="Guest Player Opportunities"
        description="Find short-term playing opportunities for tournaments and showcases. Great exposure without switching clubs."
        listingCount={guestOpportunities.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((opp) => (
            <ListingCard
              key={opp.id}
              href={`mailto:${opp.contactEmail}?subject=Guest Player Inquiry - ${opp.teamName}`}
              title={opp.teamName}
              subtitle={`${opp.tournament} · ${opp.city}, ${opp.state}`}
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
              cta="Contact Team"
            />
          ))}
        </div>
        <div className="mt-12"><AnytimeInlineCTA /></div>
      </div>
    </>
  );
}
