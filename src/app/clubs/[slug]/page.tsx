import { Suspense } from "react";
import { getClubBySlug, getClubSlugs, getTeamsByClubId, getListingOwner } from "@/lib/db";
import { ListingCard } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, ShareButtons } from "@/components/profile-ui";
import { ReviewSection } from "@/components/review-section";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const DEFAULT_SIDEBAR_PHOTO = "http://anytime-soccer.com/wp-content/uploads/2026/01/idf.webp";
const DEFAULT_HERO_PHOTO = "http://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";
const DEFAULT_PHOTOS = [
  "http://anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg",
  "http://anytime-soccer.com/wp-content/uploads/2026/02/ecnl_girls.jpg",
];
const DEFAULT_LOGO = "https://anytime-soccer.com/wp-content/uploads/2026/02/ast_logo_shield_only_blue.png";
const DEFAULT_VIDEO = "https://youtu.be/JqombeGBALU";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getClubSlugs();
  return slugs.map((slug) => ({ slug }));
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
  const heroPhoto = club.imageUrl || DEFAULT_HERO_PHOTO;
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
              <img src={club.teamPhoto || DEFAULT_SIDEBAR_PHOTO} alt={club.name} className="w-full h-[200px] object-cover block" />
              <div className="text-center py-3.5 px-4">
                <h3 className="text-[15px] font-bold text-primary leading-snug">{club.name}</h3>
                <p className="text-sm text-muted mt-1">{club.city}, {club.state}</p>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border gap-2.5">
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
            </div>

            {/* Info Table */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {[
                { label: "Level", value: club.level },
                { label: "Teams", value: String(club.teamCount) },
                { label: "Ages", value: club.ageGroups },
                { label: "Gender", value: club.gender },
                ...(club.address ? [{ label: "Address", value: club.address }] : []),
                ...(club.email ? [{ label: "Email", value: club.email }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center px-4 py-[11px] border-b border-border last:border-b-0 text-[13.5px]">
                  <span className="text-muted font-medium">{row.label}</span>
                  <span className="font-bold text-primary text-right">{row.value}</span>
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
          </aside>

          {/* ====== Hero ====== */}
          <div className="order-1 lg:order-none lg:col-start-2 bg-white rounded-2xl overflow-hidden shadow-sm">
              <img src={heroPhoto} alt={club.name} className="w-full h-[220px] object-cover block" />
              <div className="p-5 sm:p-7 sm:flex sm:gap-6 sm:items-start">
              <img
                src={logo}
                alt={`${club.name} logo`}
                className="w-[56px] h-[56px] sm:w-[72px] sm:h-[72px] rounded-xl border-2 border-border object-contain shrink-0 p-1 sm:p-1.5 bg-surface -mt-12 sm:-mt-16 relative z-10"
              />
              <div className="mt-3 sm:mt-0 sm:flex-1 sm:min-w-0">
                <h1 className="text-xl sm:text-[26px] font-extrabold text-primary leading-tight tracking-tight">{club.name}</h1>
                <p className="text-sm text-muted mt-1.5 mb-3 font-medium">
                  {club.city}, {club.state}
                </p>
                {club.description && (
                  <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">{club.description}</p>
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

          {/* ====== At a Glance ====== */}
          <div className="order-2 lg:order-none lg:col-start-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-[13px] sm:text-[15px] font-bold text-primary mb-2.5 sm:mb-3.5">At a Glance</h3>
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
              <h3 className="text-[15px] font-bold text-primary mb-3.5">Practice Schedule</h3>
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

          {/* ====== Photos & Video ====== */}
          <div className="order-5 lg:order-none lg:col-start-2 bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-primary mb-3">Photos &amp; Video</h3>
              <div className={`grid grid-cols-2 gap-1.5 ${videoUrl ? "mb-3" : ""}`}>
                {clubPhotos.map((photo, i) => (
                  <img key={i} src={photo} alt={`Club photo ${i + 1}`} className="w-full aspect-[4/3] object-cover rounded-lg block" />
                ))}
              </div>
              {videoUrl && <VideoEmbed url={videoUrl} />}
          </div>

          {/* ====== Media ====== */}
          <div className="order-5 lg:order-none lg:col-start-2 bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-primary mb-3">Media</h3>
              {club.mediaLinks && club.mediaLinks.length > 0 ? (
                <div className="space-y-2.5">
                  {club.mediaLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex gap-3 rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors group">
                      {link.image && <img src={link.image} alt="" className="w-20 h-14 object-cover rounded-lg shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary group-hover:text-accent-hover transition-colors truncate">{link.title || link.url}</p>
                        {link.description && <p className="text-xs text-muted line-clamp-2 mt-0.5">{link.description}</p>}
                        <p className="text-[11px] text-muted/60 mt-1 truncate">{(() => { try { return new URL(link.url).hostname; } catch { return link.url; } })()}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No media coverage yet.</p>
              )}
          </div>

          {/* ====== Reviews ====== */}
          <div className="order-6 lg:order-none lg:col-start-2">
            <Suspense fallback={<div className="bg-white rounded-2xl p-6 shadow-sm"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" /><div className="h-20 bg-gray-200 rounded animate-pulse" /></div>}>
              <ReviewSection listingType="club" listingId={club.id} />
            </Suspense>
          </div>

          {/* ====== Teams ====== */}
          {clubTeams.length > 0 && (
              <div className="order-7 lg:order-none lg:col-start-2 bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-[15px] font-bold text-primary mb-3.5">Teams ({clubTeams.length})</h3>
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

          {/* ====== CTA Banner ====== */}
          <div className="order-8 lg:order-none lg:col-start-2 bg-primary rounded-2xl px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-[22px] font-extrabold text-white tracking-tight mb-1.5">
                  Supplement Team Training with 5,000+ Videos
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  Structured follow-along sessions your player can do at home, in the backyard, or at the park.
                </p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <img
                  src="/ast-shield.png"
                  alt="Anytime Soccer Training"
                  className="h-20 opacity-90 hidden md:block"
                />
                <a
                  href="https://anytime-soccer.com"
                  target="_blank"
                  className="bg-[#DC373E] text-white px-7 py-3.5 rounded-xl text-[15px] font-bold whitespace-nowrap hover:bg-[#C42F36] transition-colors"
                >
                  Try It Free &rarr;
                </a>
              </div>
          </div>

        </div>
      </div>
    </>
  );
}
