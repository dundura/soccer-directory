import { getFundraiserBySlug, getDonationsByFundraiserId, getRosterByFundraiserId } from "@/lib/db";
import { VideoEmbed } from "@/components/profile-ui";
import { SharePopupButton } from "@/components/share-popup";
import { AnnouncementSection } from "@/components/announcement-section";
import { ManageListingButton } from "@/components/manage-listing-button";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function normalizeUrl(url?: string) {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `https://${url}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFundraiserBySlug(slug);
  if (!f) return {};
  return {
    title: `${f.title} — Fundraiser | Soccer Near Me`,
    description: f.description?.slice(0, 160) || `Support ${f.title} with a donation`,
    openGraph: { images: f.heroImageUrl ? [f.heroImageUrl] : [] },
  };
}

function ProgressRing({ pct, color, label, value, sub }: { pct: number; color: "navy" | "red"; label: string; value: string; sub: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const strokeColor = color === "red" ? "#DC373E" : "var(--color-primary)";
  const valueClass = color === "red" ? "text-[#DC373E]" : "text-primary";

  return (
    <div className="text-center">
      <svg width="90" height="90" viewBox="0 0 90 90" className="block mx-auto mb-1.5">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#e8edf4" strokeWidth="8" />
        <circle
          cx="45" cy="45" r={r} fill="none"
          stroke={strokeColor} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          className="transition-all duration-700"
        />
        <text x="45" y="50" textAnchor="middle" className="fill-primary" style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700 }}>
          {pct}%
        </text>
      </svg>
      <div className={`font-[family-name:var(--font-display)] text-xl font-bold ${valueClass}`}>{value}</div>
      <div className="text-[11px] text-muted mt-0.5">{sub}</div>
      <div className="text-xs text-muted font-medium mt-1">{label}</div>
    </div>
  );
}

export default async function FundraiserPage({ params }: Props) {
  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);
  if (!fundraiser) notFound();
  const [donations, roster] = await Promise.all([
    getDonationsByFundraiserId(fundraiser.id),
    getRosterByFundraiserId(fundraiser.id),
  ]);
  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const goalCents = fundraiser.goal || 0;
  const pct = goalCents > 0 ? Math.min(100, Math.round((totalRaised / goalCents) * 100)) : 0;
  const pageUrl = `https://www.soccer-near-me.com/fundraiser/${slug}`;

  const hasAnnouncements = fundraiser.announcementHeading || fundraiser.announcementText || fundraiser.announcementImage ||
    fundraiser.announcementHeading2 || fundraiser.announcementText2 || fundraiser.announcementImage2 ||
    fundraiser.announcementHeading3 || fundraiser.announcementText3 || fundraiser.announcementImage3;

  const fundPhotos = fundraiser.photos && fundraiser.photos.length > 0 ? fundraiser.photos : [];
  const hasMedia = fundPhotos.length > 0 || fundraiser.videoUrl;

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-[1100px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Hero Image */}
          {fundraiser.heroImageUrl && (
            <img
              src={fundraiser.heroImageUrl}
              alt={fundraiser.title}
              className="w-full rounded-xl object-cover mb-5"
              style={{ maxHeight: 260 }}
            />
          )}

          {/* Title & Status */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(15,30,53,0.10)] mb-6">
            <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold text-primary mb-1 leading-tight">
              {fundraiser.title}
            </h1>
            {fundraiser.tagline && (
              <p className="text-sm text-accent font-medium mb-2">{fundraiser.tagline}</p>
            )}
            {!fundraiser.active && (
              <span className="inline-block mb-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Fundraiser Closed
              </span>
            )}

            {/* Tag Bubbles */}
            {fundraiser.tags && fundraiser.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {fundraiser.tags.map((tag, i) => (
                  <span key={i} className="bg-blue-50 text-blue-800 text-sm font-semibold px-3.5 py-1.5 rounded-full border border-blue-100">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Special Announcements */}
          {hasAnnouncements && (
            <div className="space-y-4 mt-4">
              {(fundraiser.announcementHeading || fundraiser.announcementText || fundraiser.announcementImage) && (
                <AnnouncementSection heading={fundraiser.announcementHeading} text={fundraiser.announcementText} image={fundraiser.announcementImage} ctaUrl={normalizeUrl(fundraiser.announcementCtaUrl || fundraiser.websiteUrl)} ctaLabel={fundraiser.announcementCta || "Learn More \u2192"} />
              )}
              {(fundraiser.announcementHeading2 || fundraiser.announcementText2 || fundraiser.announcementImage2) && (
                <AnnouncementSection heading={fundraiser.announcementHeading2} text={fundraiser.announcementText2} image={fundraiser.announcementImage2} ctaUrl={normalizeUrl(fundraiser.announcementCtaUrl2 || fundraiser.websiteUrl)} ctaLabel={fundraiser.announcementCta2 || "Learn More \u2192"} />
              )}
              {(fundraiser.announcementHeading3 || fundraiser.announcementText3 || fundraiser.announcementImage3) && (
                <AnnouncementSection heading={fundraiser.announcementHeading3} text={fundraiser.announcementText3} image={fundraiser.announcementImage3} ctaUrl={normalizeUrl(fundraiser.announcementCtaUrl3 || fundraiser.websiteUrl)} ctaLabel={fundraiser.announcementCta3 || "Learn More \u2192"} />
              )}
            </div>
          )}

          {/* About Card */}
          {fundraiser.description && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(15,30,53,0.10)] mt-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-3 pb-2.5 border-b-2 border-border">
                About This Fundraiser
              </h2>
              <p className="text-[15px] leading-[1.7] text-primary/80 whitespace-pre-line">{fundraiser.description}</p>
            </div>
          )}

          {/* Photos & Video */}
          {hasMedia && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(15,30,53,0.10)] mt-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-3 pb-2.5 border-b-2 border-border">
                Photos &amp; Video
              </h2>
              {fundPhotos.length > 0 && (
                <div className={`grid grid-cols-2 gap-1.5 ${fundraiser.videoUrl ? "mb-3" : ""}`}>
                  {fundPhotos.map((photo, i) => (
                    <img key={i} src={photo} alt={`Photo ${i + 1}`} className="w-full aspect-[4/3] object-cover rounded-lg block" />
                  ))}
                </div>
              )}
              {fundraiser.videoUrl && <VideoEmbed url={fundraiser.videoUrl} />}
            </div>
          )}

          {/* Roster */}
          {roster.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(15,30,53,0.10)] mt-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary pb-2.5 border-b-2 border-border mb-1">
                Roster{" "}
                <span className="font-normal text-muted text-base">({roster.length})</span>
              </h2>
              <div>
                {roster.map((player) => {
                  const initials = player.playerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <div key={player.id} className="flex items-center gap-3.5 py-3 border-b border-border last:border-b-0">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.playerName} className="w-[42px] h-[42px] rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#DC373E] to-[#a02028] flex items-center justify-center text-white font-[family-name:var(--font-display)] text-lg font-bold shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-primary">{player.playerName}</div>
                        {(player.position || player.ageGroup) && (
                          <div className="text-[13px] text-muted mt-0.5">
                            {[player.position, player.ageGroup].filter(Boolean).join(" \u2022 ")}
                          </div>
                        )}
                        {player.bio && <p className="text-sm text-muted/80 mt-1">{player.bio}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        {(player.amountRaised || 0) > 0 && (
                          <div className="text-sm font-bold text-green-700 mb-0.5">
                            ${((player.amountRaised || 0) / 100).toLocaleString("en-US")}
                          </div>
                        )}
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          Player
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Supporters Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(15,30,53,0.10)] mt-6">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary pb-2.5 border-b-2 border-border mb-1">
              Supporters{" "}
              <span className="font-normal text-muted text-base">({donations.length})</span>
            </h2>

            {donations.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">Be the first to support this fundraiser!</p>
            ) : (
              <div>
                {donations.map((d) => {
                  const initials = d.donorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <div key={d.id} className="flex items-center gap-3.5 py-3 border-b border-border last:border-b-0">
                      <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-primary to-[#2a5298] flex items-center justify-center text-white font-[family-name:var(--font-display)] text-lg font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-primary">{d.donorName}</div>
                        <div className="text-[13px] text-muted mt-0.5">
                          Donated ${(d.amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          {d.onBehalfOf ? ` \u2014 on behalf of ${d.onBehalfOf}` : ""}
                        </div>
                        {d.donorMessage && <p className="text-sm text-muted/80 mt-1 italic">&ldquo;{d.donorMessage}&rdquo;</p>}
                      </div>
                      <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                        Donor
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {/* Support Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(15,30,53,0.10)]">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary text-center mb-5">
              Support This Fundraiser
            </h3>

            {/* Progress Rings */}
            <div className="flex justify-center gap-8 mb-6">
              <ProgressRing
                pct={pct}
                color="navy"
                label="Fundraising Goal"
                value={`$${(totalRaised / 100).toLocaleString("en-US")}`}
                sub={goalCents > 0 ? `raised of $${(goalCents / 100).toLocaleString("en-US")}` : "total raised"}
              />
              <ProgressRing
                pct={donations.length > 0 ? Math.min(100, donations.length * 10) : 0}
                color="red"
                label="Donations"
                value={`${donations.length}`}
                sub={donations.length === 1 ? "supporter" : "supporters"}
              />
            </div>

            {/* Give Now Button */}
            {fundraiser.active && (
              <a
                href={`/fundraiser/${slug}/donate`}
                className="block w-full py-3.5 rounded-lg bg-[#DC373E] text-white text-center font-[family-name:var(--font-display)] text-xl font-bold tracking-wide hover:bg-[#C42F36] transition-all hover:-translate-y-0.5 mb-2.5"
              >
                Give Now
              </a>
            )}

            {/* Share Button with Popup */}
            <SharePopupButton url={pageUrl} title={fundraiser.title} />
          </div>

          {/* Organizer Card */}
          {(fundraiser.coachName || fundraiser.coachEmail || fundraiser.coachPhone) && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(15,30,53,0.10)] text-center">
              <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-primary to-[#1a4080] border-[3px] border-[#DC373E] flex items-center justify-center mx-auto mb-3">
                <span className="font-[family-name:var(--font-display)] text-xl font-extrabold text-white">
                  {(fundraiser.coachName || "?")[0].toUpperCase()}
                </span>
              </div>
              {fundraiser.coachName && (
                <h4 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-1">{fundraiser.coachName}</h4>
              )}
              <p className="text-[13px] text-muted mb-2">Organizer</p>
              {fundraiser.coachEmail && (
                <a href={`mailto:${fundraiser.coachEmail}`} className="block text-[13px] text-[#DC373E] hover:underline mb-0.5">{fundraiser.coachEmail}</a>
              )}
              {fundraiser.coachPhone && (
                <a href={`tel:${fundraiser.coachPhone}`} className="block text-[13px] text-[#DC373E] hover:underline">{fundraiser.coachPhone}</a>
              )}
              {/* Social links */}
              {(fundraiser.websiteUrl || fundraiser.facebookUrl || fundraiser.instagramUrl) && (
                <div className="flex justify-center gap-3 mt-4">
                  {fundraiser.websiteUrl && (
                    <a href={fundraiser.websiteUrl.startsWith("http") ? fundraiser.websiteUrl : `https://${fundraiser.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary hover:bg-border transition-colors text-sm" title="Website">
                      &#127760;
                    </a>
                  )}
                  {fundraiser.facebookUrl && (
                    <a href={fundraiser.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary hover:bg-border transition-colors text-sm font-bold" title="Facebook">
                      f
                    </a>
                  )}
                  {fundraiser.instagramUrl && (
                    <a href={fundraiser.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary hover:bg-border transition-colors text-sm font-bold italic" title="Instagram">
                      in
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manage Listing (owner/admin only) */}
          <ManageListingButton ownerId={fundraiser.userId} listingType="fundraiser" listingId={fundraiser.id} />
        </div>
      </div>
    </div>
  );
}
