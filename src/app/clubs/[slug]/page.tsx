import { clubs, teams } from "@/data/sample-data";
import { Badge, ListingCard, AnytimeInlineCTA } from "@/components/ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return clubs.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = clubs.find((c) => c.slug === slug);
  if (!club) return {};
  return {
    title: `${club.name} | Youth Soccer Club in ${club.city}, ${club.state}`,
    description: club.description,
  };
}

export default async function ClubDetailPage({ params }: Props) {
  const { slug } = await params;
  const club = clubs.find((c) => c.slug === slug);
  if (!club) notFound();

  const clubTeams = teams.filter((t) => t.clubId === club.id);

  return (
    <>
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/clubs" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">← All Clubs</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="blue">{club.level}</Badge>
            <Badge variant="default">{club.gender}</Badge>
            <Badge variant="default">{club.ageGroups}</Badge>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{club.name}</h1>
          <p className="text-white/60 text-lg">{club.city}, {club.state}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About</h2>
              <p className="text-muted leading-relaxed">{club.description}</p>
            </section>

            {/* Club Info */}
            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Club Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><p className="text-xs text-muted mb-1">Level</p><p className="font-medium">{club.level}</p></div>
                <div><p className="text-xs text-muted mb-1">Total Teams</p><p className="font-medium">{club.teamCount}</p></div>
                <div><p className="text-xs text-muted mb-1">Age Groups</p><p className="font-medium">{club.ageGroups}</p></div>
                <div><p className="text-xs text-muted mb-1">Gender</p><p className="font-medium">{club.gender}</p></div>
                {club.website && <div><p className="text-xs text-muted mb-1">Website</p><a href={`https://${club.website}`} target="_blank" className="font-medium text-accent-hover hover:underline">{club.website}</a></div>}
                {club.email && <div><p className="text-xs text-muted mb-1">Email</p><a href={`mailto:${club.email}`} className="font-medium text-accent-hover hover:underline">{club.email}</a></div>}
              </div>
            </section>

            {/* Teams */}
            {clubTeams.length > 0 && (
              <section>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Teams ({clubTeams.length})</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {clubTeams.map((team) => (
                    <ListingCard
                      key={team.id}
                      href={`/teams/${team.slug}`}
                      title={team.name}
                      subtitle={`Coach ${team.coach}`}
                      badges={[
                        { label: team.level, variant: "blue" },
                        { label: team.gender, variant: team.gender === "Boys" ? "blue" : "purple" },
                        ...(team.lookingForPlayers ? [{ label: "Recruiting", variant: "green" as const }] : []),
                      ]}
                      details={[
                        { label: "Birth Year", value: team.ageGroup },
                        ...(team.positionsNeeded ? [{ label: "Positions Needed", value: team.positionsNeeded }] : []),
                      ]}
                      cta="View Team"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact CTA */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Interested in this club?</h3>
              <p className="text-muted text-sm mb-4">Reach out directly to learn about tryouts, team availability, and programs.</p>
              {club.email && (
                <a href={`mailto:${club.email}`} className="block w-full text-center py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors mb-3">
                  Contact Club
                </a>
              )}
              {club.website && (
                <a href={`https://${club.website}`} target="_blank" className="block w-full text-center py-3 rounded-xl border-2 border-border text-primary font-semibold hover:bg-surface transition-colors">
                  Visit Website
                </a>
              )}
            </div>

            {/* Anytime CTA */}
            <AnytimeInlineCTA />
          </div>
        </div>
      </div>
    </>
  );
}
