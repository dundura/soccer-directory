import { teams, clubs } from "@/data/sample-data";
import { Badge, AnytimeInlineCTA } from "@/components/ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return teams.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = teams.find((t) => t.slug === slug);
  if (!team) return {};
  return {
    title: `${team.name} | Youth Soccer Team in ${team.city}, ${team.state}`,
    description: team.description || `${team.level} team for ${team.ageGroup} ${team.gender} in ${team.city}, ${team.state}`,
  };
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const team = teams.find((t) => t.slug === slug);
  if (!team) notFound();
  const club = clubs.find((c) => c.id === team.clubId);

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/teams" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">← All Teams</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="blue">{team.level}</Badge>
            <Badge variant={team.gender === "Boys" ? "blue" : "purple"}>{team.gender}</Badge>
            <Badge variant="default">{team.ageGroup}</Badge>
            {team.lookingForPlayers && <Badge variant="green">Recruiting</Badge>}
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{team.name}</h1>
          <p className="text-white/60 text-lg">
            {club ? <a href={`/clubs/${club.slug}`} className="hover:text-white transition-colors">{club.name}</a> : team.clubName} · {team.city}, {team.state}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {team.description && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About</h2>
                <p className="text-muted leading-relaxed">{team.description}</p>
              </section>
            )}

            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Team Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><p className="text-xs text-muted mb-1">Level</p><p className="font-medium">{team.level}</p></div>
                <div><p className="text-xs text-muted mb-1">Birth Year</p><p className="font-medium">{team.ageGroup}</p></div>
                <div><p className="text-xs text-muted mb-1">Gender</p><p className="font-medium">{team.gender}</p></div>
                <div><p className="text-xs text-muted mb-1">Head Coach</p><p className="font-medium">{team.coach}</p></div>
                <div><p className="text-xs text-muted mb-1">Season</p><p className="font-medium">{team.season}</p></div>
                {team.positionsNeeded && <div><p className="text-xs text-muted mb-1">Positions Needed</p><p className="font-medium">{team.positionsNeeded}</p></div>}
              </div>
            </section>

            {team.lookingForPlayers && (
              <section className="bg-red-50 rounded-2xl border border-red-200 p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#DC373E] mb-2">🔴 This Team Is Recruiting</h2>
                <p className="text-red-700 mb-4">
                  This team is actively looking for players{team.positionsNeeded ? ` at the following positions: ${team.positionsNeeded}` : ""}.
                  Reach out to the coaching staff to schedule a tryout or guest training session.
                </p>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Contact this team</h3>
              <p className="text-muted text-sm mb-4">Reach out to learn about tryouts and team availability.</p>
              <a href="#" className="block w-full text-center py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors mb-3">
                Request Tryout Info
              </a>
              {club && (
                <a href={`/clubs/${club.slug}`} className="block w-full text-center py-3 rounded-xl border-2 border-border text-primary font-semibold hover:bg-surface transition-colors">
                  View Club Profile
                </a>
              )}
            </div>
            <AnytimeInlineCTA />
          </div>
        </div>
      </div>
    </>
  );
}
