import { getClubBySlug, getClubSlugs, getTeamsByClubId, getListingOwner } from "@/lib/db";
import { Badge, ListingCard, AnytimeInlineCTA } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, PhotoGallery, PracticeSchedule, SocialLinks, ShareButtons } from "@/components/profile-ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getClubSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) return {};
  return {
    title: `${club.name} | Youth Soccer Club in ${club.city}, ${club.state}`,
    description: club.description,
  };
}

export default async function ClubDetailPage({ params }: Props) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  const [clubTeams, ownerId] = await Promise.all([
    getTeamsByClubId(club.id),
    getListingOwner("club", slug),
  ]);

  const pageUrl = `https://www.soccer-near-me.com/clubs/${slug}`;

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/clubs" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; All Clubs</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="blue">{club.level}</Badge>
            <Badge variant="default">{club.gender}</Badge>
            <Badge variant="default">{club.ageGroups}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{club.name}</h1>
              <p className="text-white/60 text-lg">{club.city}, {club.state}</p>
            </div>
            <ManageListingButton ownerId={ownerId} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6 lg:order-first order-first">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {club.teamPhoto && (
                <img src={club.teamPhoto} alt={club.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                {club.logo && (
                  <img src={club.logo} alt={`${club.name} logo`} className="w-16 h-16 rounded-xl object-contain border border-border mb-3 -mt-12 bg-white relative z-10" />
                )}
                <h2 className="font-[family-name:var(--font-display)] font-bold text-lg">{club.name}</h2>
                <p className="text-muted text-sm mb-4">{club.city}, {club.state}</p>

                <a
                  href={`/contact/club/${slug}`}
                  className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors mb-3"
                >
                  Contact Club
                </a>
                {club.website && (
                  <a
                    href={club.website.startsWith("http") ? club.website : `https://${club.website}`}
                    target="_blank"
                    className="block w-full text-center py-3 rounded-xl border-2 border-border text-primary font-semibold hover:bg-surface transition-colors"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Level</p><p className="font-medium">{club.level}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Teams</p><p className="font-medium">{club.teamCount}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Ages</p><p className="font-medium">{club.ageGroups}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Gender</p><p className="font-medium">{club.gender}</p></div>
              {club.address && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Address</p><p className="font-medium">{club.address}</p></div>}
              {club.phone && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Phone</p><p className="font-medium">{club.phone}</p></div>}
              {club.email && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Email</p><a href={`mailto:${club.email}`} className="font-medium text-accent-hover hover:underline">{club.email}</a></div>}
            </div>

            <AnytimeInlineCTA />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">{club.description}</p>
            </section>

            {/* Practice Schedule */}
            {club.practiceSchedule && club.practiceSchedule.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Practice Days</h2>
                <PracticeSchedule days={club.practiceSchedule} />
              </section>
            )}

            {/* Video */}
            {club.videoUrl && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Video</h2>
                <VideoEmbed url={club.videoUrl} />
              </section>
            )}

            {/* Photos */}
            {club.photos && club.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Photos</h2>
                <PhotoGallery photos={club.photos} />
              </section>
            )}

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

            {/* Social + Share */}
            <div className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-6">
              {club.socialMedia && (
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Follow Us</h3>
                  <SocialLinks website={club.website} facebook={club.socialMedia.facebook} instagram={club.socialMedia.instagram} />
                </div>
              )}
              <div>
                <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Share</h3>
                <ShareButtons url={pageUrl} title={club.name} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
