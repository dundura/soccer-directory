import { getPlayerProfileBySlug, getPlayerProfileSlugs, getListingOwner } from "@/lib/db";
import { Badge } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { PlayerAvatar } from "@/components/player-avatar";
import { ContactPlayerForm } from "./contact-form";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const DEFAULT_HERO_IMAGE = "https://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

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
    `/guest-play/players/${slug}`,
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

  return (
    <>
      {/* Hero Banner */}
      <div className="relative">
        <div className="h-48 md:h-64 bg-primary overflow-hidden">
          <img
            src={player.imageUrl || DEFAULT_HERO_IMAGE}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-6">
            <a href="/guest-play/players" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; All Players</a>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="blue">{player.position}</Badge>
              {player.secondaryPosition && <Badge variant="default">{player.secondaryPosition}</Badge>}
              <Badge variant={player.gender === "Boys" ? "blue" : "purple"}>{player.gender}</Badge>
              <Badge variant="default">{player.birthYear}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-white mb-1">{player.playerName}</h1>
                <p className="text-white/60 text-lg">
                  {player.currentClub && <>{player.currentClub} &middot; </>}
                  {player.city}, {player.state}
                </p>
              </div>
              <ManageListingButton ownerId={ownerId} listingType="player" listingId={player.id} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <PlayerAvatar
                src={player.teamPhoto}
                name={player.playerName}
                className="w-full aspect-square object-cover"
              />
              <div className="p-6">
                {player.logo && (
                  <img src={player.logo} alt="Club logo" className="w-12 h-12 rounded-xl object-contain border border-border mb-3 -mt-10 bg-white relative z-10" />
                )}
                <div className="space-y-3 mb-5">
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Position</p>
                    <p className="font-[family-name:var(--font-display)] font-bold text-lg">
                      {player.position}
                      {player.secondaryPosition && ` / ${player.secondaryPosition}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Birth Year</p>
                    <p className="font-medium">{player.birthYear}</p>
                  </div>
                  {player.height && (
                    <div>
                      <p className="text-xs text-muted font-medium uppercase tracking-wide">Height</p>
                      <p className="font-medium">{player.height}</p>
                    </div>
                  )}
                  {player.preferredFoot && (
                    <div>
                      <p className="text-xs text-muted font-medium uppercase tracking-wide">Preferred Foot</p>
                      <p className="font-medium">{player.preferredFoot}</p>
                    </div>
                  )}
                  {player.currentClub && (
                    <div>
                      <p className="text-xs text-muted font-medium uppercase tracking-wide">Current Club</p>
                      <p className="font-medium">{player.currentClub}</p>
                    </div>
                  )}
                  {player.gpa && (
                    <div>
                      <p className="text-xs text-muted font-medium uppercase tracking-wide">GPA</p>
                      <p className="font-medium">{player.gpa}</p>
                    </div>
                  )}
                </div>

                <a
                  href="#contact-player"
                  className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
                >
                  Contact Player
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Level</p><p className="font-medium">{player.level}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Gender</p><p className="font-medium">{player.gender}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Location</p><p className="font-medium">{player.city}, {player.state}</p></div>
              {player.phone && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Phone</p><p className="font-medium">{player.phone}</p></div>}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {player.lookingFor && (
              <section className="bg-white rounded-2xl border-2 border-accent/20 p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Looking For</h2>
                <p className="text-muted leading-relaxed whitespace-pre-line">{player.lookingFor}</p>
              </section>
            )}

            {player.description && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About</h2>
                <p className="text-muted leading-relaxed whitespace-pre-line">{player.description}</p>
              </section>
            )}

            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Player Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><p className="text-xs text-muted mb-1">Position</p><p className="font-medium">{player.position}{player.secondaryPosition ? ` / ${player.secondaryPosition}` : ""}</p></div>
                <div><p className="text-xs text-muted mb-1">Birth Year</p><p className="font-medium">{player.birthYear}</p></div>
                <div><p className="text-xs text-muted mb-1">Location</p><p className="font-medium">{player.city}, {player.state}</p></div>
                <div><p className="text-xs text-muted mb-1">Level</p><p className="font-medium">{player.level}</p></div>
                {player.height && <div><p className="text-xs text-muted mb-1">Height</p><p className="font-medium">{player.height}</p></div>}
                {player.preferredFoot && <div><p className="text-xs text-muted mb-1">Preferred Foot</p><p className="font-medium">{player.preferredFoot}</p></div>}
                {player.currentClub && <div><p className="text-xs text-muted mb-1">Current Club</p><p className="font-medium">{player.currentClub}</p></div>}
                {player.gpa && <div><p className="text-xs text-muted mb-1">GPA</p><p className="font-medium">{player.gpa}</p></div>}
              </div>
            </section>

            {(player.videoUrl || player.videoUrl2 || player.videoUrl3) && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Highlights</h2>
                <div className="space-y-6">
                  {player.videoUrl && <VideoEmbed url={player.videoUrl} />}
                  {player.videoUrl2 && <VideoEmbed url={player.videoUrl2} />}
                  {player.videoUrl3 && <VideoEmbed url={player.videoUrl3} />}
                </div>
              </section>
            )}

            {player.photos && player.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Photos</h2>
                <PhotoGallery photos={player.photos} />
              </section>
            )}

            {/* Contact Form */}
            <section id="contact-player" className="bg-white rounded-2xl border-2 border-accent/20 p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">Contact This Player</h2>
              <p className="text-muted text-sm mb-6">Interested in this player? Send a message and they will be notified via email.</p>
              <ContactPlayerForm playerName={player.playerName} slug={slug} />
            </section>

            {player.socialMedia && (player.socialMedia.facebook || player.socialMedia.instagram) && (
              <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Follow</h3>
                <SocialLinks facebook={player.socialMedia.facebook} instagram={player.socialMedia.instagram} />
              </div>
            )}
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
