import { getTeamBySlug, getTeamSlugs, getClubById, getListingOwner, getSimilarTeams } from "@/lib/db";
import { ListingCard } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, PhotoGallery, PracticeSchedule, ShareButtons } from "@/components/profile-ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const DEFAULT_TEAM_PHOTO = "https://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";
const DEFAULT_LOGO = "https://anytime-soccer.com/wp-content/uploads/2026/02/ast_logo_shield_only_blue.png";

const EVENT_TYPE_COLORS: Record<string, string> = {
  Tryout: "bg-red-50 text-red-700 border-red-200",
  Tournament: "bg-blue-50 text-blue-700 border-blue-200",
  Showcase: "bg-purple-50 text-purple-700 border-purple-200",
  "Training Session": "bg-green-50 text-green-700 border-green-200",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getTeamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) return {};
  return {
    title: `${team.name} | Youth Soccer Team in ${team.city}, ${team.state}`,
    description: team.description || `${team.level} team for ${team.ageGroup} ${team.gender} in ${team.city}, ${team.state}`,
  };
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) notFound();
  const [club, ownerId, similarTeams] = await Promise.all([
    team.clubId ? getClubById(team.clubId) : Promise.resolve(null),
    getListingOwner("team", slug),
    getSimilarTeams(slug, team.state, team.ageGroup),
  ]);

  const pageUrl = `https://www.soccer-near-me.com/teams/${slug}`;
  const teamPhoto = team.teamPhoto || DEFAULT_TEAM_PHOTO;
  const logo = team.logo || DEFAULT_LOGO;

  return (
    <>
      {/* Breadcrumb bar */}
      <div className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a href="/teams" className="text-white/50 text-sm hover:text-white transition-colors">&larr; All Teams</a>
          <ManageListingButton ownerId={ownerId} />
        </div>
      </div>

      {/* Two-column hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="rounded-2xl overflow-hidden border border-border">
              <img src={teamPhoto} alt={team.name} className="w-full h-64 lg:h-80 object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <img src={logo} alt={`${team.name} logo`} className="w-16 h-16 rounded-xl object-contain border border-border bg-white p-2 shrink-0" />
                <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold">{team.name}</h1>
              </div>
              <p className="text-muted mb-3">
                {club ? <a href={`/clubs/${club.slug}`} className="text-accent-hover hover:underline">{club.name}</a> : team.clubName} &middot; {team.city}, {team.state}
              </p>
              {team.description && (
                <p className="text-muted leading-relaxed line-clamp-4 mb-3">{team.description}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <a href={`/contact/team/${slug}`} className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors">
                  Contact Team
                </a>
                {team.lookingForPlayers && (
                  <a href={`/contact/team/${slug}`} className="px-6 py-3 rounded-xl bg-[#DC373E] text-white font-semibold hover:opacity-90 transition-opacity">
                    Request Tryout
                  </a>
                )}
                {club && (
                  <a href={`/clubs/${club.slug}`} className="px-6 py-3 rounded-xl border-2 border-border text-primary font-semibold hover:bg-surface transition-colors">
                    View Club
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left sidebar */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Head Coach</p><p className="font-medium">{team.coach}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Season</p><p className="font-medium">{team.season}</p></div>
              {team.positionsNeeded && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Positions Needed</p><p className="font-medium">{team.positionsNeeded}</p></div>}
              {team.phone && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Phone</p><p className="font-medium">{team.phone}</p></div>}
            </div>

            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Share</h3>
              <ShareButtons url={pageUrl} title={team.name} />
            </div>

          </div>

          {/* Right content */}
          <div className="lg:col-span-2 space-y-8 order-1 lg:order-2">
            {/* Practice Schedule */}
            {team.practiceSchedule && team.practiceSchedule.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Practice Schedule</h2>
                <PracticeSchedule days={team.practiceSchedule} />
              </section>
            )}

            {/* Photos */}
            {team.photos && team.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Photos</h2>
                <PhotoGallery photos={team.photos} />
              </section>
            )}

            {/* Video */}
            {team.videoUrl && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Video</h2>
                <VideoEmbed url={team.videoUrl} />
              </section>
            )}

            {/* Upcoming Events */}
            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Upcoming Events</h2>
              {team.events && team.events.length > 0 ? (
                <div className="space-y-3">
                  {team.events.map((ev, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-surface transition-colors">
                      <div className={`px-3 py-1 rounded-lg text-xs font-semibold border shrink-0 ${EVENT_TYPE_COLORS[ev.type] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                        {ev.type || "Event"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{ev.name}</p>
                        <p className="text-muted text-sm">{ev.date}{ev.location ? ` \u00b7 ${ev.location}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm">No upcoming events posted.</p>
              )}
            </section>

          </div>
        </div>
      </div>

      {/* Similar Teams — full width */}
      {similarTeams.length > 0 && (
        <div className="bg-surface border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-6">Similar Teams</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarTeams.map((t) => (
                <ListingCard
                  key={t.id}
                  href={`/teams/${t.slug}`}
                  title={t.name}
                  subtitle={`${t.city}, ${t.state}`}
                  badges={[
                    { label: t.level, variant: "blue" },
                    { label: t.ageGroup },
                    ...(t.lookingForPlayers ? [{ label: "Recruiting", variant: "green" as const }] : []),
                  ]}
                  details={[
                    { label: "Coach", value: t.coach },
                  ]}
                  cta="View Team"
                />
              ))}
            </div>
          </div>
        </div>
      )}

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
