import { getPlayerProfileBySlug, getPlayerProfileSlugs, getListingOwner } from "@/lib/db";
import { Badge, AnytimeInlineCTA } from "@/components/ui";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { PlayerAvatar } from "@/components/player-avatar";
import { SponsorsSection } from "@/components/sponsors-section";
import { ListingPostsSidebar } from "@/components/listing-posts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingEventsSection } from "@/components/listing-events-section";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getPlayerProfileSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerProfileBySlug(slug);
  if (!player) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${player.playerName} — ${player.position} | Player Profile`,
    player.description || `${player.position} from ${player.city}, ${player.state}. Birth year: ${player.birthYear}. ${player.lookingFor || ""}`,
    player.teamPhoto || player.imageUrl || player.logo,
    `/players/${slug}`,
  );
}

export default async function PlayerDetailPage({ params }: Props) {
  const { slug } = await params;

  let player;
  try {
    player = await getPlayerProfileBySlug(slug);
  } catch {
    throw new Error("Failed to load player profile. Please try again later.");
  }
  if (!player) notFound();

  let ownerId: string | null = null;
  try {
    ownerId = await getListingOwner("player", slug);
  } catch {
    ownerId = null;
  }

  const playerPhoto = player.teamPhoto || player.imageUrl;
  const hasMultiplePositions = !!player.secondaryPosition;
  const allPositions = player.position + (player.secondaryPosition ? `, ${player.secondaryPosition}` : "");

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[1100px] mx-auto px-6 py-3.5 text-sm text-muted flex items-center justify-between">
        <div>
          <a href="/players" className="text-primary hover:underline">Players</a>
          {" › "}
          <span>{player.state}</span>
          {" › "}
          <span>{player.playerName}</span>
        </div>
        <ManageListingButton ownerId={ownerId} listingType="player" listingId={player.id} />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pb-16">
        {/* ====== HERO: GPS-Style Two-Column Layout ====== */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-0">
            {/* Left: Player Photo */}
            <div className="relative bg-white flex items-center justify-center p-6 border-r border-border">
              {playerPhoto ? (
                <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={playerPhoto}
                    alt={player.playerName}
                    className="w-full max-h-[500px] object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <PlayerAvatar
                    src={undefined}
                    name={player.playerName}
                    className="w-[160px] h-[160px] rounded-full text-5xl"
                  />
                </div>
              )}
            </div>

            {/* Right: Player Info */}
            <div className="p-6 md:p-8 flex flex-col relative">
              {/* Contact button - top right */}
              <a
                href={`/contact/player/${slug}`}
                className="absolute top-6 right-6 md:top-8 md:right-8 z-10 inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors"
              >
                Contact
              </a>

              {/* Player Name */}
              <InlineEditField ownerId={ownerId} listingType="player" listingId={player.id} field="playerName" value={player.playerName} tag="h1" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase leading-tight tracking-tight" />

              {(player.currentClub || player.teamName) && (
                <p className="text-sm font-semibold text-muted mt-1 md:-mt-2">{player.teamName || player.currentClub}</p>
              )}

              {/* Location with icon */}
              <div className="flex items-center gap-3 mt-3 text-[15px]">
                <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <span className="font-semibold text-primary">{player.city}, {player.state}</span>
              </div>

              {/* Badges - under city */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant={player.gender === "Boys" ? "blue" : "purple"}>{player.gender}</Badge>
                <Badge variant="default">{player.birthMonth ? `${player.birthMonth}, ${player.birthYear}` : player.birthYear}</Badge>
                {player.level && <Badge variant="default">{player.level}</Badge>}
                {player.availableForGuestPlay && <Badge variant="green">Available for Guest Play</Badge>}
                {player.lookingForTeam ? (
                  <Badge variant="blue">Available for Tryouts</Badge>
                ) : (
                  player.availableForGuestPlay && <Badge variant="default">Guest Player Only</Badge>
                )}
              </div>

              {/* Attribute grid */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-border">
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wider">Birth Year</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{player.birthMonth ? `${player.birthMonth}, ${player.birthYear}` : player.birthYear}</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wider">Level/League</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{player.level || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wider">Position</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{player.position}{player.secondaryPosition ? ` / ${player.secondaryPosition}` : ""}</p>
                </div>
                {player.preferredFoot && (
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Preferred Foot</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{player.preferredFoot}</p>
                  </div>
                )}
              </div>

              {/* About & Looking For - inside hero card */}
              {(player.description || player.lookingFor || (player.socialMedia && (player.socialMedia.instagram || player.socialMedia.youtube))) && (
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">About &amp; Looking For</h2>
                    <EditSectionLink ownerId={ownerId} listingType="player" listingId={player.id} />
                  </div>
                  {player.description && (
                    <InlineEditField ownerId={ownerId} listingType="player" listingId={player.id} field="description" value={player.description} tag="p" className="text-sm leading-relaxed text-gray-500 whitespace-pre-line" multiline />
                  )}
                  {player.lookingFor && (
                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line mt-3">{player.lookingFor}</p>
                  )}
                  {/* Social Links under About */}
                  {player.socialMedia && (player.socialMedia.instagram || player.socialMedia.youtube) && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                      <span className="text-xs font-semibold text-muted uppercase tracking-wider">Follow</span>
                      <div className="flex gap-2">
                        {player.socialMedia.instagram && (
                          <a href={player.socialMedia.instagram.startsWith("http") ? player.socialMedia.instagram : `https://instagram.com/${player.socialMedia.instagram}`} target="_blank" rel="noopener" title="Instagram" className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                          </a>
                        )}
                        {player.socialMedia.youtube && (
                          <a href={player.socialMedia.youtube.startsWith("http") ? player.socialMedia.youtube : `https://youtube.com/${player.socialMedia.youtube}`} target="_blank" rel="noopener" title="YouTube" className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====== Content Sections ====== */}
        <div className="space-y-6">

          {/* Highlight Videos */}
          {(player.videoUrl || player.videoUrl2 || player.videoUrl3 || (player.highlightVideos && player.highlightVideos.length > 0)) && (
            <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">Highlight Videos</h2>
                </div>
                <EditSectionLink ownerId={ownerId} listingType="player" listingId={player.id} />
              </div>
              <div className="p-5 sm:p-6 pt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {player.videoUrl && (
                    <div className="rounded-xl overflow-hidden border border-border">
                      <VideoEmbed url={player.videoUrl} />
                    </div>
                  )}
                  {player.videoUrl2 && (
                    <div className="rounded-xl overflow-hidden border border-border">
                      <VideoEmbed url={player.videoUrl2} />
                    </div>
                  )}
                  {player.videoUrl3 && (
                    <div className="rounded-xl overflow-hidden border border-border">
                      <VideoEmbed url={player.videoUrl3} />
                    </div>
                  )}
                  {player.highlightVideos && player.highlightVideos.map((v, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-border">
                      {v.title && <p className="text-xs font-bold text-primary px-3 pt-2.5">{v.title}</p>}
                      <VideoEmbed url={v.url} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Game Highlights */}
          {player.gameHighlights && player.gameHighlights.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">Game Highlights</h2>
                </div>
                <EditSectionLink ownerId={ownerId} listingType="player" listingId={player.id} />
              </div>
              <div className="p-5 sm:p-6 pt-4 space-y-5">
                {player.gameHighlights.map((gh, i) => (
                  <div key={i}>
                    <p className="text-sm font-bold text-primary mb-2">{gh.title}</p>
                    <div className="rounded-xl overflow-hidden border border-border">
                      <VideoEmbed url={gh.url} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Player Resume */}
          {player.cvUrl && (
            <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">Player Resume</h2>
              </div>
              <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border">
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">{player.playerName}</p>
                  <p className="text-xs text-muted">Player Resume / CV</p>
                </div>
                <a
                  href={player.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors whitespace-nowrap"
                >
                  Open Resume
                </a>
              </div>
            </section>
          )}

          {/* Player Posts */}
          {/* Events */}
          <ListingEventsSection listingType="player" listingId={player.id} listingSlug={slug} ownerId={ownerId} />

          <ListingPostsSidebar listingType="player" listingId={player.id} slug={slug} ownerId={ownerId} />

          {/* Photos */}
          {player.photos && player.photos.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">Action Photos</h2>
                </div>
                <EditSectionLink ownerId={ownerId} listingType="player" listingId={player.id} />
              </div>
              <div className="p-5 sm:p-6 pt-4">
                <PhotoGallery photos={player.photos} />
              </div>
            </section>
          )}

          {/* Sponsors */}
          {player.sponsors && player.sponsors.length > 0 && (
            <SponsorsSection sponsors={player.sponsors} />
          )}

        </div>
      </div>

      {/* CTA Banner */}
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <AnytimeInlineCTA />
      </div>
    </>
  );
}
