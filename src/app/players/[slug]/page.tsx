import { getPlayerProfileBySlug, getPlayerProfileSlugs, getListingOwner } from "@/lib/db";
import { Badge, AnytimeInlineCTA } from "@/components/ui";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { PlayerAvatar } from "@/components/player-avatar";
import { HeroImage } from "@/components/hero-image";
import { SponsorsSection } from "@/components/sponsors-section";
import { ContactPlayerForm } from "./contact-form";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingPostsSidebar } from "@/components/listing-posts";

export const dynamic = "force-dynamic";

const DEFAULT_HERO_IMAGE = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

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

  const heroPhoto = player.imageUrl || DEFAULT_HERO_IMAGE;
  const heroPos = player.heroImagePosition ?? 50;

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
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 lg:gap-6 items-start">
          {/* ====== LEFT SIDEBAR ====== */}
          <aside className="order-4 lg:order-none lg:[grid-row:span_10] flex flex-col gap-4">
            {/* Player Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <PlayerAvatar
                src={player.teamPhoto}
                name={player.playerName}
                className="w-full h-[200px] object-cover"
              />
              <div className="text-center py-3.5 px-4">
                <h3 className="text-[15px] font-bold text-primary leading-snug">{player.playerName}</h3>
                <p className="text-sm text-muted mt-1">{player.city}, {player.state}</p>
              </div>
              <div className="flex flex-col gap-2 px-4 py-2.5 border-t border-border">
                <div className="flex items-center justify-between gap-2.5">
                  {player.availableForGuestPlay && (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full flex-1 text-center">
                      Available for Guest Play
                    </span>
                  )}
                  <a
                    href="#contact-player"
                    className="bg-[#DC373E] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors whitespace-nowrap"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>

            {/* Info Table */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {[
                { label: "Position", value: `${player.position}${player.secondaryPosition ? ` / ${player.secondaryPosition}` : ""}` },
                { label: "Birth Year", value: player.birthYear },
                { label: "Gender", value: player.gender },
                { label: "Level", value: player.level },
                ...(player.height ? [{ label: "Height", value: player.height }] : []),
                ...(player.preferredFoot ? [{ label: "Preferred Foot", value: player.preferredFoot }] : []),
                ...(player.gpa ? [{ label: "GPA", value: player.gpa }] : []),
                ...(player.currentClub ? [{ label: "Club", value: player.currentClub }] : []),
                ...(player.teamName ? [{ label: "Team", value: player.teamName }] : []),
                ...(player.league ? [{ label: "League", value: player.league }] : []),
              ].map((row, i) => (
                <div key={i} className={`flex justify-between items-center px-4 py-2.5 text-sm ${i ? "border-t border-border" : ""}`}>
                  <span className="text-muted font-medium">{row.label}</span>
                  <span className="font-bold text-primary text-right">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Favorites */}
            {(player.favoriteTeam || player.favoritePlayer) && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Favorites</p>
                </div>
                {player.favoriteTeam && (
                  <div className="flex justify-between items-center px-4 py-2.5 text-sm border-b border-border">
                    <span className="text-muted font-medium">Team</span>
                    <span className="font-bold text-primary">{player.favoriteTeam}</span>
                  </div>
                )}
                {player.favoritePlayer && (
                  <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                    <span className="text-muted font-medium">Player</span>
                    <span className="font-bold text-primary">{player.favoritePlayer}</span>
                  </div>
                )}
              </div>
            )}

            {/* Social Links */}
            {player.socialMedia && (player.socialMedia.facebook || player.socialMedia.instagram || player.socialMedia.youtube) && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h4 className="text-sm font-bold mb-2.5">Follow</h4>
                <SocialLinks website={player.socialMedia.youtube} facebook={player.socialMedia.facebook} instagram={player.socialMedia.instagram} />
              </div>
            )}

            {/* Phone / Contact Info */}
            {player.phone && (
              <div className="bg-white rounded-2xl p-[18px] shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone</p>
                <p className="text-sm font-bold text-primary">{player.phone}</p>
              </div>
            )}
          </aside>

          {/* ====== Hero ====== */}
          <div className="order-1 lg:order-none lg:col-start-2 bg-white rounded-2xl overflow-hidden shadow-sm">
            <HeroImage src={heroPhoto} alt={player.playerName} id={player.id} imagePosition={heroPos} />
            <div className="p-5 sm:p-7">
              {player.logo && (
                <img src={player.logo} alt="Club logo" className="w-[56px] h-[56px] rounded-xl border-2 border-border object-contain shrink-0 p-1 bg-surface -mt-8 relative z-10 mb-2" />
              )}
              <InlineEditField ownerId={ownerId} listingType="player" listingId={player.id} field="playerName" value={player.playerName} tag="h1" className="text-xl sm:text-[26px] font-extrabold text-primary leading-tight tracking-tight" />
              {player.tagline && (
                <InlineEditField ownerId={ownerId} listingType="player" listingId={player.id} field="tagline" value={player.tagline} tag="p" className="text-sm text-accent font-medium mt-1" />
              )}
              <p className="text-sm text-muted mt-1.5 mb-3 font-medium">
                {player.teamName && <>{player.teamName} &middot; </>}
                {!player.teamName && player.currentClub && <>{player.currentClub} &middot; </>}
                {player.city}, {player.state}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="blue">{player.position}</Badge>
                {player.secondaryPosition && <Badge variant="default">{player.secondaryPosition}</Badge>}
                <Badge variant={player.gender === "Boys" ? "blue" : "purple"}>{player.gender}</Badge>
                <Badge variant="default">{player.birthYear}</Badge>
                {player.availableForGuestPlay && <Badge variant="green">Available for Guest Play</Badge>}
              </div>
              {player.description && (
                <InlineEditField ownerId={ownerId} listingType="player" listingId={player.id} field="description" value={player.description} tag="p" className="text-sm leading-relaxed text-gray-500 whitespace-pre-line" multiline />
              )}
            </div>
          </div>

          {/* ====== Main Content ====== */}
          <div className="order-3 lg:order-none lg:col-start-2 space-y-5">
            {/* Looking For */}
            {player.lookingFor && (
              <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] font-bold text-primary">Looking For</h2>
                  <EditSectionLink ownerId={ownerId} listingType="player" listingId={player.id} />
                </div>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{player.lookingFor}</p>
              </section>
            )}

            {/* Featured Highlight Video */}
            {player.videoUrl && (
              <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] font-bold text-primary">Featured Highlight</h2>
                  <EditSectionLink ownerId={ownerId} listingType="player" listingId={player.id} />
                </div>
                <VideoEmbed url={player.videoUrl} />
              </section>
            )}

            {/* More Highlight Videos */}
            {(player.videoUrl2 || player.videoUrl3) && (
              <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-[15px] font-bold text-primary mb-4">More Highlights</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {player.videoUrl2 && <VideoEmbed url={player.videoUrl2} />}
                  {player.videoUrl3 && <VideoEmbed url={player.videoUrl3} />}
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

            {/* Contact Form */}
            <section id="contact-player" className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
              <h2 className="text-[15px] font-bold text-primary mb-2">Contact This Player</h2>
              <p className="text-muted text-sm mb-6">Interested in this player? Send a message and they will be notified via email.</p>
              <ContactPlayerForm playerName={player.playerName} slug={slug} />
            </section>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <AnytimeInlineCTA />
      </div>
    </>
  );
}
