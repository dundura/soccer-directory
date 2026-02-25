import { getTournamentBySlug, getTournamentSlugs, getListingOwner } from "@/lib/db";
import { Badge, AnytimeInlineCTA } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getTournamentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) return {};
  return {
    title: `${tournament.name} | Soccer Tournament in ${tournament.city}, ${tournament.state}`,
    description: tournament.description,
  };
}

export default async function TournamentDetailPage({ params }: Props) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) notFound();
  const ownerId = await getListingOwner("tournament", slug);

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/tournaments" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">← All Tournaments</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="blue">{tournament.level}</Badge>
            <Badge variant="orange">{tournament.format}</Badge>
            <Badge variant="default">{tournament.gender}</Badge>
            <Badge variant="default">{tournament.ageGroups}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{tournament.name}</h1>
              <p className="text-white/60 text-lg">{tournament.organizer} · {tournament.city}, {tournament.state}</p>
            </div>
            <ManageListingButton ownerId={ownerId} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About This Tournament</h2>
              <p className="text-muted leading-relaxed">{tournament.description}</p>
            </section>
            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Tournament Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><p className="text-xs text-muted mb-1">Dates</p><p className="font-medium">{tournament.dates}</p></div>
                <div><p className="text-xs text-muted mb-1">Level</p><p className="font-medium">{tournament.level}</p></div>
                <div><p className="text-xs text-muted mb-1">Age Groups</p><p className="font-medium">{tournament.ageGroups}</p></div>
                <div><p className="text-xs text-muted mb-1">Gender</p><p className="font-medium">{tournament.gender}</p></div>
                <div><p className="text-xs text-muted mb-1">Format</p><p className="font-medium">{tournament.format}</p></div>
                <div><p className="text-xs text-muted mb-1">Entry Fee</p><p className="font-medium">{tournament.entryFee}</p></div>
                <div><p className="text-xs text-muted mb-1">Location</p><p className="font-medium">{tournament.city}, {tournament.state}</p></div>
              </div>
            </section>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6">
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold mb-1">{tournament.entryFee}</p>
              <p className="text-muted text-sm mb-4">{tournament.dates}</p>
              {tournament.registrationUrl ? (
                <a href={tournament.registrationUrl} target="_blank" className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors mb-3">
                  Register Now →
                </a>
              ) : (
                <a href={tournament.email ? `mailto:${tournament.email}` : "#"} className="block w-full text-center py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors mb-3">
                  Contact Organizer
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
