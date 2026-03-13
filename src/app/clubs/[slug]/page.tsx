import { Suspense } from "react";
import { getClubBySlug, getClubSlugs, getTeamsByClubId, getListingOwner } from "@/lib/db";
import { ListingCard, AnytimeInlineCTA } from "@/components/ui";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { VideoEmbed, ShareButtons } from "@/components/profile-ui";
import { ReviewSection } from "@/components/review-section";
import { HeroImage } from "@/components/hero-image";
import { AnnouncementSection } from "@/components/announcement-section";
import { SponsorsSection } from "@/components/sponsors-section";
import { FeaturedArticles } from "@/components/featured-articles";
import { PhotoGrid } from "@/components/photo-grid";
import { ClickableImage } from "@/components/clickable-image";
import { ListingPostsSidebar } from "@/components/listing-posts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function normalizeUrl(url?: string) { return url ? (url.startsWith("http") ? url : `https://${url}`) : undefined; }
const DEFAULT_SIDEBAR_PHOTO = "https://media.anytime-soccer.com/wp-content/uploads/2026/01/idf.webp";
const DEFAULT_HERO_PHOTO = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";
const DEFAULT_PHOTOS = [
  "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg",
  "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecnl_girls.jpg",
];
const DEFAULT_LOGO = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ast_logo_shield_only_blue.png";
const DEFAULT_VIDEO = "https://youtu.be/JqombeGBALU";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getClubSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${club.name} | Youth Soccer Club in ${club.city}, ${club.state}`,
    club.description || `Youth soccer club in ${club.city}, ${club.state}`,
    club.imageUrl || club.teamPhoto || club.logo,
    `/clubs/${slug}`,
  );
}

export default async function ClubDetailPage({ params }: Props) {
  const { slug } = await params;

  let club;
  try {
    club = await getClubBySlug(slug);
  } catch {
    throw new Error("Failed to load club details. Please try again later.");
  }
  if (!club) notFound();

  let clubTeams: import("@/lib/types").Team[] = [], ownerId: string | null = null;
  try {
    [clubTeams, ownerId] = await Promise.all([
      getTeamsByClubId(club.id),
      getListingOwner("club", slug),
    ]);
  } catch {
    clubTeams = [];
    ownerId = null;
  }

  const pageUrl = `https://www.soccer-near-me.com/clubs/${slug}`;
  const imgPos = club.imagePosition ?? 50;
  const heroPos = club.heroImagePosition ?? 50;
  const heroPhoto = club.imageUrl || club.teamPhoto || DEFAULT_HERO_PHOTO;
  const clubPhotos = club.photos && club.photos.length > 0 ? club.photos : DEFAULT_PHOTOS;
  const logo = club.logo || DEFAULT_LOGO;
  const videoUrl = club.videoUrl === undefined || club.videoUrl === null ? DEFAULT_VIDEO : club.videoUrl || null;
  const practiceSet = new Set(
    (club.practiceSchedule || []).map((d) => d.trim().slice(0, 3).toLowerCase())
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[1100px] mx-auto px-6 py-3.5 text-sm text-muted flex items-center justify-between">
        <div>
          <a href="/clubs" className="text-primary hover:underline">Clubs</a>
          {" \u203A "}
          <span>{club.state}</span>
          {" \u203A "}
          <span>{club.name}</span>
        </div>
        <ManageListingButton ownerId={ownerId} listingType="club" listingId={club.id} />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 lg:gap-6 items-start">

          {/* ====== LEFT SIDEBAR (first in source for desktop, order-4 on mobile) ====== */}
          <aside className="order-4 lg:order-none lg:[grid-row:span_10] flex flex-col gap-4">

            {/* Photo + Club ID + Contact */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <ClickableImage src={club.teamPhoto || DEFAULT_SIDEBAR_PHOTO} alt={club.name} className="w-full h-[200px] object-cover block" style={{ objectPosition: `center ${imgPos}%` }} />
              <div className="text-center py-3.5 px-4">
                <h3 className="text-[15px] font-bold text-primary leading-snug">{club.name}</h3>
                <p className="text-sm text-muted mt-1">{club.city}, {club.state}</p>
              </div>
              <div className="flex flex-col gap-2 px-4 py-2.5 border-t border-border">
                <div className="flex items-center justify-between gap-2.5">
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full flex-1 text-center">
                    Roster spots available!
                  </span>
                  <a
                    href={`/contact/club/${slug}`}
                    className="bg-[#DC373E] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors whitespace-nowrap"
                  >
                    Contact
                  </a>
                </div>
                {club.scholarshipsAvailable === "Yes" && (
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full text-center">
                    Scholarships Available
                  </span>
                )}
                {club.guestPlayersWelcomed === "Yes" && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full text-center">
                    Guest Players Welcomed
                  </span>
                )}
              </div>
            </div>

            {/* Info Table */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {[
                { label: "Level", value: club.level },
                ...(club.league ? [{ label: "League", value: club.league, href: club.leagueUrl }] : []),
                { label: "Teams", value: String(club.teamCount) },
                { label: "Ages", value: club.ageGroups },
                { label: "Gender", value: club.gender },
                ...(club.address ? [{ label: "Address", value: club.address }] : []),
                ...(club.email ? [{ label: "Email", value: "Contact", href: `/contact/club/${slug}`, internal: true }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center px-4 py-[11px] border-b border-border last:border-b-0 text-[13.5px]">
                  <span className="text-muted font-medium">{row.label}</span>
                  {"href" in row && row.href ? (
                    "internal" in row && row.internal ? (
                      <a href={row.href} className="font-bold text-accent hover:text-accent-hover transition-colors text-right">{row.value}</a>
                    ) : (
                      <a href={row.href.startsWith("http") ? row.href : `https://${row.href}`} target="_blank" rel="noopener noreferrer" className="font-bold text-accent hover:text-accent-hover transition-colors text-right">{row.value} ↗</a>
                    )
                  ) : (
                    <span className="font-bold text-primary text-right">{row.value}</span>
                  )}
                </div>
              ))}
              {club.socialMedia && (club.socialMedia.facebook || club.socialMedia.instagram) && (
                <div className="flex justify-center gap-4 py-3.5 border-t border-border">
                  {club.socialMedia.instagram && (
                    <a href={club.socialMedia.instagram} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Instagram">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                  )}
                  {club.socialMedia.facebook && (
                    <a href={club.socialMedia.facebook} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Facebook">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Details */}
            {(club.phone || club.address) && (
              <div className="bg-white rounded-2xl p-[18px] shadow-sm space-y-3.5">
                {club.phone && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone</p>
                    <p className="text-sm font-bold text-primary">{club.phone}</p>
                  </div>
                )}
                {club.address && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Location</p>
                    <p className="text-sm font-bold text-primary">{club.address}</p>
                  </div>
                )}
              </div>
            )}

            {/* Donate / Fundraiser */}
            {club.fundraiserSlug && (
              <a href={`/fundraiser/${club.fundraiserSlug}`} className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="bg-[#DC373E] px-4 py-3 text-center">
                  <span className="text-white font-bold text-sm">Support Us — Donate</span>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-muted">Help {club.name} reach their goals</p>
                </div>
              </a>
            )}

            {/* Blog Post */}
            {club.blogUrl && (
              <a href={club.blogUrl} className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1.5">Featured Article</p>
                <h4 className="text-sm font-bold text-primary group-hover:text-accent-hover transition-colors leading-snug">Read about {club.name} &rarr;</h4>
              </a>
            )}

            {/* Share */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="text-sm font-bold mb-2.5">Share this profile!</h4>
              <ShareButtons url={pageUrl} title={club.name} />
            </div>

            {/* Our Posts */}
            <ListingPostsSidebar listingType="club" listingId={String(club.id)} slug={slug} ownerId={ownerId} />
          </aside>

          {/* ====== Hero ====== */}
          <div className="order-1 lg:order-none lg:col-start-2 bg-white rounded-2xl overflow-hidden shadow-sm">
              <HeroImage src={heroPhoto} alt={club.name} id={club.id} imagePosition={heroPos} />
              <div className="p-5 sm:p-7">
              <img
                src={logo}
                alt={`${club.name} logo`}
                className="w-[56px] h-[56px] sm:w-[72px] sm:h-[72px] rounded-xl border-2 border-border object-contain shrink-0 p-1 sm:p-1.5 bg-surface -mt-8 sm:-mt-10 relative z-10 mb-4"
              />
              <div>
                <InlineEditField ownerId={ownerId} listingType="club" listingId={club.id} field="name" value={club.name} tag="h1" className="text-xl sm:text-[26px] font-extrabold text-primary leading-tight tracking-tight" />
                {club.tagline && (
                  <InlineEditField ownerId={ownerId} listingType="club" listingId={club.id} field="tagline" value={club.tagline} tag="p" className="text-sm text-accent font-medium mt-1" />
                )}
                <p className="text-sm text-muted mt-1.5 mb-3 font-medium">
                  {club.city}, {club.state}
                </p>
                {club.description && (
                  <div className="mb-0">
                    <InlineEditField ownerId={ownerId} listingType="club" listingId={club.id} field="description" value={club.description} tag="p" className="text-sm leading-relaxed text-gray-500 whitespace-pre-line" multiline />
                  </div>
                )}
                <div className="flex gap-2.5 mt-[18px] flex-wrap">
                  {club.website && (
                    <a
                      href={club.website.startsWith("http") ? club.website : `https://${club.website}`}
                      target="_blank"
                      className="bg-white text-primary border-2 border-border px-[22px] py-[11px] rounded-lg text-sm font-bold hover:bg-surface transition-colors"
                    >
                      &#127760; Visit Website
                    </a>
                  )}
                </div>
              </div>
              </div>
          </div>

          {/* ====== Special Announcements ====== */}
          {(club.announcementHeading || club.announcementText || club.announcementImage || club.announcementHeading2 || club.announcementText2 || club.announcementImage2 || club.announcementHeading3 || club.announcementText3 || club.announcementImage3) && (
            <div className="order-2 lg:order-none lg:col-start-2 space-y-4">
              {(club.announcementHeading || club.announcementText || club.announcementImage) && <AnnouncementSection heading={club.announcementHeading} text={club.announcementText} image={club.announcementImage} ctaUrl={normalizeUrl(club.announcementCtaUrl || club.website)} ctaLabel={club.announcementCta || "Learn More →"} />}
              {(club.announcementHeading2 || club.announcementText2 || club.announcementImage2) && <AnnouncementSection heading={club.announcementHeading2} text={club.announcementText2} image={club.announcementImage2} ctaUrl={normalizeUrl(club.announcementCtaUrl2 || club.website)} ctaLabel={club.announcementCta2 || "Learn More →"} />}
              {(club.announcementHeading3 || club.announcementText3 || club.announcementImage3) && <AnnouncementSection heading={club.announcementHeading3} text={club.announcementText3} image={club.announcementImage3} ctaUrl={normalizeUrl(club.announcementCtaUrl3 || club.website)} ctaLabel={club.announcementCta3 || "Learn More →"} />}
            </div>
          )}

          {/* ====== At a Glance ====== */}
          <div className={`${(club.announcementHeading || club.announcementText || club.announcementImage || club.announcementHeading2 || club.announcementText2 || club.announcementImage2 || club.announcementHeading3 || club.announcementText3 || club.announcementImage3) ? "order-3" : "order-2"} lg:order-none lg:col-start-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
                <h3 className="text-[13px] sm:text-[15px] font-bold text-primary">At a Glance</h3>
                <EditSectionLink ownerId={ownerId} listingType="club" listingId={club.id} />
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 mt-1">
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="text-sm sm:text-lg leading-none">&#127942;</span>
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Level</span>
                  <span className="text-xs sm:text-sm font-bold text-primary ml-auto">{club.level}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="text-sm sm:text-lg leading-none">&#9917;</span>
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Teams</span>
                  <span className="text-xs sm:text-sm font-bold text-primary ml-auto">{club.teamCount}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="text-sm sm:text-lg leading-none">&#128197;</span>
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Age</span>
                  <span className="text-xs sm:text-sm font-bold text-primary ml-auto">{club.ageGroups}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="text-sm sm:text-lg leading-none">&#128101;</span>
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Gender</span>
                  <span className="text-xs sm:text-sm font-bold text-primary ml-auto">{club.gender}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="text-sm sm:text-lg leading-none">&#128170;</span>
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Practices</span>
                  <span className="text-xs sm:text-sm font-bold text-primary ml-auto">
                    {club.practiceSchedule && club.practiceSchedule.length > 0
                      ? `${club.practiceSchedule.length}x / week`
                      : "—"}
                  </span>
                </div>
              </div>
          </div>

          {/* ====== Practice Schedule ====== */}
          <div className="order-3 lg:order-none lg:col-start-2 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-[15px] font-bold text-primary">Practice Schedule</h3>
                <EditSectionLink ownerId={ownerId} listingType="club" listingId={club.id} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {ALL_DAYS.map((day) => (
                  <span
                    key={day}
                    className={`px-3.5 py-[7px] rounded-full text-sm font-semibold ${
                      practiceSet.has(day.toLowerCase())
                        ? "bg-primary text-white"
                        : "bg-surface text-gray-400"
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <span className="text-base">&#128205;</span>
                <span>{club.address || `${club.city}, ${club.state}`}</span>
              </div>
          </div>

          {/* ====== Open Positions ====== */}
          {club.openPositions && club.openPositions.length > 0 && (
            <div className="order-4 lg:order-none lg:col-start-2 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-[15px] font-bold text-primary">Open Positions</h3>
                <EditSectionLink ownerId={ownerId} listingType="club" listingId={club.id} />
              </div>
              <div className="space-y-3">
                {club.openPositions.map((pos, i) => (
                  <div key={i} className="border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-primary">{pos.title}</h4>
                        {pos.description && (
                          <p className="text-sm text-muted mt-1 leading-relaxed">{pos.description}</p>
                        )}
                      </div>
                      {pos.applyUrl ? (
                        <a
                          href={pos.applyUrl.startsWith("http") ? pos.applyUrl : `https://${pos.applyUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors"
                        >
                          Apply Here &#8599;
                        </a>
                      ) : (
                        <a
                          href={`/contact/club/${slug}`}
                          className="shrink-0 bg-[#DC373E] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors"
                        >
                          Contact Us
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====== Photos & Video ====== */}
          <div className="order-5 lg:order-none lg:col-start-2 bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-primary">Photos &amp; Video</h3>
                <EditSectionLink ownerId={ownerId} listingType="club" listingId={club.id} />
              </div>
              <div className={`grid grid-cols-2 gap-1.5 ${videoUrl ? "mb-3" : ""}`}>
                <PhotoGrid photos={clubPhotos} alt="Club photo" />
              </div>
              {videoUrl && <VideoEmbed url={videoUrl} />}
          </div>

          {/* ====== Featured Articles ====== */}
          <div className="order-5 lg:order-none lg:col-start-2">
            <FeaturedArticles />
          </div>

          {/* ====== Media ====== */}
          {club.mediaLinks && club.mediaLinks.length > 0 && (
          <div className="order-5 lg:order-none lg:col-start-2 bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-bold text-primary">Media</h3>
                <EditSectionLink ownerId={ownerId} listingType="club" listingId={club.id} />
              </div>
              <div className="space-y-2">
                {club.mediaLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors group">
                    <span className="shrink-0">&#128279;</span>
                    <span className="group-hover:underline truncate">{link.title || link.url}</span>
                  </a>
                ))}
              </div>
          </div>
          )}

          {/* ====== Reviews ====== */}
          <div className="order-6 lg:order-none lg:col-start-2">
            <Suspense fallback={<div className="bg-white rounded-2xl p-6 shadow-sm"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" /><div className="h-20 bg-gray-200 rounded animate-pulse" /></div>}>
              <ReviewSection listingType="club" listingId={club.id} />
            </Suspense>
          </div>

          {/* ====== Teams ====== */}
          {clubTeams.length > 0 && (
              <div className="order-7 lg:order-none lg:col-start-2 bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-[15px] font-bold text-primary">Teams ({clubTeams.length})</h3>
                  <EditSectionLink ownerId={ownerId} listingType="club" listingId={club.id} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {clubTeams.map((t) => (
                    <a
                      key={t.id}
                      href={`/teams/${t.slug}`}
                      className="border-[1.5px] border-border rounded-xl p-3.5 no-underline hover:border-primary hover:shadow-md transition-all block"
                    >
                      <h4 className="text-[13px] font-bold text-primary mb-1.5 leading-snug">{t.name}</h4>
                      <div className="flex gap-2 flex-wrap">
                        <span className="bg-surface text-muted px-2 py-0.5 rounded-full text-[11px] font-semibold">{t.level}</span>
                        <span className="bg-surface text-muted px-2 py-0.5 rounded-full text-[11px] font-semibold">{t.gender}</span>
                        <span className="bg-surface text-muted px-2 py-0.5 rounded-full text-[11px] font-semibold">{t.ageGroup}</span>
                        {t.lookingForPlayers && (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[11px] font-semibold">Recruiting</span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
          )}

          {/* ====== Sponsors ====== */}
          {club.sponsors && club.sponsors.length > 0 && (
            <div className="order-8 lg:order-none lg:col-start-2">
              <SponsorsSection sponsors={club.sponsors} />
            </div>
          )}

          {/* ====== CTA Banner ====== */}
          <div className="order-9 lg:order-none lg:col-start-2">
            <AnytimeInlineCTA />
          </div>

        </div>
      </div>
    </>
  );
}
