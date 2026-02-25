import { getTournamentBySlug, getTournamentSlugs, getListingOwner } from "@/lib/db";
import { Badge, AnytimeInlineCTA } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, PhotoGallery, SocialLinks, ShareButtons } from "@/components/profile-ui";
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

  const pageUrl = `https://www.soccer-near-me.com/tournaments/${slug}`;

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/tournaments" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; All Tournaments</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="blue">{tournament.level}</Badge>
            <Badge variant="orange">{tournament.format}</Badge>
            <Badge variant="default">{tournament.gender}</Badge>
            <Badge variant="default">{tournament.ageGroups}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{tournament.name}</h1>
              <p className="text-white/60 text-lg">{tournament.organizer} &middot; {tournament.city}, {tournament.state}</p>
            </div>
            <ManageListingButton ownerId={ownerId} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {tournament.teamPhoto && (
                <img src={tournament.teamPhoto} alt={tournament.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                {tournament.logo && (
                  <img src={tournament.logo} alt={`${tournament.name} logo`} className="w-16 h-16 rounded-xl object-contain border border-border mb-3 -mt-12 bg-white relative z-10" />
                )}
                <div className="space-y-3 mb-5">
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">When</p>
                    <p className="font-[family-name:var(--font-display)] font-bold text-lg">{tournament.dates}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Entry Fee</p>
                    <p className="font-[family-name:var(--font-display)] font-bold text-2xl">{tournament.entryFee}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Where</p>
                    <p className="font-medium">{tournament.city}, {tournament.state}</p>
                  </div>
                </div>
                {tournament.registrationUrl ? (
                  <a href={tournament.registrationUrl} target="_blank" className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors mb-3">
                    Register Now &rarr;
                  </a>
                ) : (
                  <a href={`/contact/tournament/${slug}`} className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors mb-3">
                    Contact Organizer
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Level</p><p className="font-medium">{tournament.level}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Format</p><p className="font-medium">{tournament.format}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Ages</p><p className="font-medium">{tournament.ageGroups}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Gender</p><p className="font-medium">{tournament.gender}</p></div>
              {tournament.phone && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Phone</p><p className="font-medium">{tournament.phone}</p></div>}
              {tournament.email && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Email</p><a href={`mailto:${tournament.email}`} className="font-medium text-accent-hover hover:underline">{tournament.email}</a></div>}
            </div>

            <AnytimeInlineCTA />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About This Tournament</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">{tournament.description}</p>
            </section>

            {tournament.videoUrl && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Video</h2>
                <VideoEmbed url={tournament.videoUrl} />
              </section>
            )}

            {tournament.photos && tournament.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Photos</h2>
                <PhotoGallery photos={tournament.photos} />
              </section>
            )}

            <div className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-6">
              {tournament.socialMedia && (
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Follow</h3>
                  <SocialLinks facebook={tournament.socialMedia.facebook} instagram={tournament.socialMedia.instagram} />
                </div>
              )}
              <div>
                <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Share</h3>
                <ShareButtons url={pageUrl} title={tournament.name} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
