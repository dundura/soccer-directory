import { getPlayerProfileBySlug, getPlayerProfileSlugs, getListingOwner } from "@/lib/db";
import { Badge, AnytimeInlineCTA } from "@/components/ui";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { PlayerAvatar } from "@/components/player-avatar";
import { SponsorsSection } from "@/components/sponsors-section";
import { ContactPlayerForm } from "./contact-form";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
    player.teamPhoto || player.imageUrl,
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
        {/* ====== HERO: Two-Column Layout ====== */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-0">
            {/* Left: Player Photo */}
            <div className="relative bg-primary/5 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
              {playerPhoto ? (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-xl opacity-30"
                    style={{ backgroundImage: `url(${playerPhoto})` }}
                  />
                  <img
                    src={playerPhoto}
                    alt={player.playerName}
                    className="relative z-10 w-full h-full object-cover"
                  />
                </>
              ) : (
                <PlayerAvatar
                  src={undefined}
                  name={player.playerName}
                  className="w-[180px] h-[180px] rounded-full text-5xl"
                />
              )}
            </div>

            {/* Right: Player Info */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              {player.logo && (
                <img src={player.logo} alt="Club logo" className="w-[48px] h-[48px] rounded-xl border-2 border-border object-contain p-1 bg-surface mb-3" />
              )}
              <InlineEditField ownerId={ownerId} listingType="player" listingId={player.id} field="playerName" value={player.playerName} tag="h1" className="text-2xl sm:text-3xl font-extrabold text-primary leading-tight tracking-tight" />
              {player.tagline && (
                <InlineEditField ownerId={ownerId} listingType="player" listingId={player.id} field="tagline" value={player.tagline} tag="p" className="text-sm text-accent font-medium mt-1" />
              )}

              {/* Location, Position, Gender with icons */}
              <div className="flex flex-col gap-1.5 mt-3 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="font-medium">{player.city}, {player.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>
                  <span className="font-medium">{player.position}{player.secondaryPosition ? ` / ${player.secondaryPosition}` : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className="font-medium">{player.gender}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="blue">{player.position}</Badge>
                {player.secondaryPosition && <Badge variant="default">{player.secondaryPosition}</Badge>}
                <Badge variant={player.gender === "Boys" ? "blue" : "purple"}>{player.gender}</Badge>
                <Badge variant="default">{player.birthYear}</Badge>
                {player.level && <Badge variant="default">{player.level}</Badge>}
                {player.availableForGuestPlay && <Badge variant="green">Available for Guest Play</Badge>}
              </div>

              {/* Contact Button */}
              <a
                href="#contact-player"
                className="mt-5 inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors w-fit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Contact This Player
              </a>
            </div>
          </div>
        </div>

        {/* ====== Player Details Grid ====== */}
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { label: "Position", value: `${player.position}${player.secondaryPosition ? ` / ${player.secondaryPosition}` : ""}` },
              { label: "Birth Year", value: player.birthYear },
              { label: "Gender", value: player.gender },
              { label: "Level", value: player.level || "—" },
              { label: "Preferred Foot", value: player.preferredFoot || "—" },
              { label: "Club", value: player.currentClub || "—" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-sm font-bold text-primary">{item.value}</p>
                <p className="text-xs text-muted mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ====== Content Sections ====== */}
        <div className="space-y-6">
          {/* About */}
          {player.description && (
            <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
              <h2 className="text-[15px] font-bold text-primary mb-3">About</h2>
              <InlineEditField ownerId={ownerId} listingType="player" listingId={player.id} field="description" value={player.description} tag="p" className="text-sm leading-relaxed text-gray-500 whitespace-pre-line" multiline />
            </section>
          )}

          {/* Looking For */}
          {player.lookingFor && (
            <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-primary">Looking For</h2>
                <EditSectionLink ownerId={ownerId} listingType="player" listingId={player.id} />
              </div>
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{player.lookingFor}</p>
            </section>
          )}

          {/* Highlight Videos */}
          {(player.videoUrl || player.videoUrl2 || player.videoUrl3 || (player.highlightVideos && player.highlightVideos.length > 0)) && (
            <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-bold text-primary">Highlight Videos</h2>
                <EditSectionLink ownerId={ownerId} listingType="player" listingId={player.id} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {player.videoUrl && <VideoEmbed url={player.videoUrl} />}
                {player.videoUrl2 && <VideoEmbed url={player.videoUrl2} />}
                {player.videoUrl3 && <VideoEmbed url={player.videoUrl3} />}
                {player.highlightVideos && player.highlightVideos.map((v, i) => (
                  <div key={i}>
                    {v.title && <p className="text-sm font-bold text-primary mb-2">{v.title}</p>}
                    <VideoEmbed url={v.url} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Game Highlights */}
          {player.gameHighlights && player.gameHighlights.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-bold text-primary">Game Highlights</h2>
                <EditSectionLink ownerId={ownerId} listingType="player" listingId={player.id} />
              </div>
              <div className="space-y-6">
                {player.gameHighlights.map((gh, i) => (
                  <div key={i}>
                    <p className="text-sm font-bold text-primary mb-2">{gh.title}</p>
                    <VideoEmbed url={gh.url} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Player Resume */}
          {player.cvUrl && (
            <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
              <h2 className="text-[15px] font-bold text-primary mb-4">Player Resume</h2>
              <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">{player.playerName}</p>
                  <p className="text-xs text-muted">Player Resume</p>
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

          {/* Photos */}
          {player.photos && player.photos.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-bold text-primary">Photos</h2>
                <EditSectionLink ownerId={ownerId} listingType="player" listingId={player.id} />
              </div>
              <PhotoGallery photos={player.photos} />
            </section>
          )}

          {/* Sponsors */}
          {player.sponsors && player.sponsors.length > 0 && (
            <SponsorsSection sponsors={player.sponsors} />
          )}

          {/* Social Links */}
          {player.socialMedia && (player.socialMedia.facebook || player.socialMedia.instagram || player.socialMedia.youtube) && (
            <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
              <h2 className="text-[15px] font-bold text-primary mb-3">Follow</h2>
              <SocialLinks website={player.socialMedia.youtube} facebook={player.socialMedia.facebook} instagram={player.socialMedia.instagram} />
            </section>
          )}

          {/* Contact Form - always visible */}
          <section id="contact-player" className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-[15px] font-bold text-primary mb-2">Contact This Player</h2>
            <p className="text-muted text-sm mb-6">Interested in this player? Send a message and they will be notified via email.</p>
            <ContactPlayerForm playerName={player.playerName} slug={slug} />
          </section>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <AnytimeInlineCTA />
      </div>
    </>
  );
}
