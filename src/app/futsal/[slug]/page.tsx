import { getFutsalTeamBySlug, getFutsalTeamSlugs, getListingOwner } from "@/lib/db";
import { Badge } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, PhotoGallery, PracticeSchedule, SocialLinks, ShareButtons } from "@/components/profile-ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getFutsalTeamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = await getFutsalTeamBySlug(slug);
  if (!team) return {};
  return {
    title: `${team.name} | Futsal Team in ${team.city}, ${team.state}`,
    description: team.description || `${team.level} futsal team for ${team.ageGroup} ${team.gender} in ${team.city}, ${team.state}`,
  };
}

export default async function FutsalDetailPage({ params }: Props) {
  const { slug } = await params;
  const team = await getFutsalTeamBySlug(slug);
  if (!team) notFound();
  const ownerId = await getListingOwner("futsal", slug);

  const pageUrl = `https://www.soccer-near-me.com/futsal/${slug}`;

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/futsal" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; All Futsal Teams</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="blue">{team.level}</Badge>
            <Badge variant={team.gender === "Boys" || team.gender === "Men" ? "blue" : "purple"}>{team.gender}</Badge>
            <Badge variant="orange">{team.format}</Badge>
            <Badge variant="default">{team.ageGroup}</Badge>
            {team.lookingForPlayers && <Badge variant="green">Recruiting</Badge>}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{team.name}</h1>
              <p className="text-white/60 text-lg">
                {team.clubName && `${team.clubName} \u00b7 `}{team.city}, {team.state}
              </p>
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
              <img src={team.teamPhoto || "https://anytime-soccer.com/wp-content/uploads/2026/02/futsal.png"} alt={team.name} className="w-full h-48 object-cover" />
              <div className="p-6">
                {team.logo && (
                  <img src={team.logo} alt={`${team.name} logo`} className="w-16 h-16 rounded-xl object-contain border border-border mb-3 -mt-12 bg-white relative z-10" />
                )}
                <h2 className="font-[family-name:var(--font-display)] font-bold text-lg">{team.name}</h2>
                <p className="text-muted text-sm mb-4">{team.city}, {team.state}</p>

                <a
                  href={`/contact/futsal/${slug}`}
                  className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors mb-3"
                >
                  Contact Team
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Level</p><p className="font-medium">{team.level}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Age Group</p><p className="font-medium">{team.ageGroup}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Format</p><p className="font-medium">{team.format}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Head Coach</p><p className="font-medium">{team.coach}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Season</p><p className="font-medium">{team.season}</p></div>
              {team.positionsNeeded && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Positions Needed</p><p className="font-medium">{team.positionsNeeded}</p></div>}
              {team.address && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Address</p><p className="font-medium">{team.address}</p></div>}
              {team.phone && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Phone</p><p className="font-medium">{team.phone}</p></div>}
            </div>

          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {team.description && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About</h2>
                <p className="text-muted leading-relaxed whitespace-pre-line">{team.description}</p>
              </section>
            )}

            {team.lookingForPlayers && (
              <section className="bg-red-50 rounded-2xl border border-red-200 p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#DC373E] mb-2">This Team Is Recruiting</h2>
                <p className="text-red-700 mb-4">
                  This futsal team is actively looking for players{team.positionsNeeded ? ` at the following positions: ${team.positionsNeeded}` : ""}.
                  Reach out to the coaching staff to schedule a tryout.
                </p>
                <a href={`/contact/futsal/${slug}`} className="inline-block px-6 py-3 rounded-xl bg-[#DC373E] text-white font-semibold hover:opacity-90 transition-opacity">
                  Request Tryout Info
                </a>
              </section>
            )}

            {team.practiceSchedule && team.practiceSchedule.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Practice Days</h2>
                <PracticeSchedule days={team.practiceSchedule} />
              </section>
            )}

            {team.videoUrl && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Video</h2>
                <VideoEmbed url={team.videoUrl} />
              </section>
            )}

            {team.photos && team.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Photos</h2>
                <PhotoGallery photos={team.photos} />
              </section>
            )}

            <div className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-6">
              {team.socialMedia && (
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Follow Us</h3>
                  <SocialLinks facebook={team.socialMedia.facebook} instagram={team.socialMedia.instagram} />
                </div>
              )}
              <div>
                <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Share</h3>
                <ShareButtons url={pageUrl} title={team.name} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anytime Soccer Training Banner */}
      <div className="bg-[#0F3154] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-3">
              Supplement Team Training with 5,000+ Follow-Along Videos
            </h2>
            <p className="text-white/70 text-lg mb-6">
              Structured sessions your player can do at home, in the backyard, or at the park.
            </p>
            <a
              href="https://anytime-soccer.com"
              target="_blank"
              className="inline-block px-8 py-4 rounded-xl bg-[#DC373E] text-white font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Try It Free &rarr;
            </a>
          </div>
          <img
            src="/ast-shield.png"
            alt="Anytime Soccer Training"
            className="hidden md:block w-48 h-48 object-contain"
          />
        </div>
      </div>
    </>
  );
}
