import { Suspense } from "react";
import { getTeamBySlug, getTeamSlugs, getClubById, getListingOwner, getSimilarTeams } from "@/lib/db";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, ShareButtons } from "@/components/profile-ui";
import { ReviewSection } from "@/components/review-section";
import { HeroImage } from "@/components/hero-image";
import { AnnouncementSection } from "@/components/announcement-section";
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

const EVENT_TYPE_COLORS: Record<string, string> = {
  Tryout: "bg-red-100 text-red-700",
  Tournament: "bg-blue-100 text-blue-700",
  Showcase: "bg-purple-100 text-purple-700",
  "Training Session": "bg-green-100 text-green-700",
  Training: "bg-green-100 text-green-700",
};

function parseEventDate(dateStr: string) {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return { month: d.toLocaleDateString("en-US", { month: "short" }), day: String(d.getDate()) };
  }
  const m = dateStr.match(/([A-Za-z]+)\s+(\d+)/);
  if (m) return { month: m[1].slice(0, 3), day: m[2] };
  return { month: "", day: dateStr };
}

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getTeamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${team.name} | Youth Soccer Team in ${team.city}, ${team.state}`,
    team.description || `${team.level} team for ${team.ageGroup} ${team.gender} in ${team.city}, ${team.state}`,
    team.imageUrl || team.teamPhoto || team.logo,
    `/teams/${slug}`,
  );
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;

  let team;
  try {
    team = await getTeamBySlug(slug);
  } catch {
    throw new Error("Failed to load team details. Please try again later.");
  }
  if (!team) notFound();

  let club: import("@/lib/types").Club | null = null, ownerId: string | null = null, similarTeams: import("@/lib/types").Team[] = [];
  try {
    [club, ownerId, similarTeams] = await Promise.all([
      team.clubId ? getClubById(team.clubId) : Promise.resolve(null),
      getListingOwner("team", slug),
      getSimilarTeams(slug, team.state, team.ageGroup),
    ]);
  } catch {
    club = null;
    ownerId = null;
    similarTeams = [];
  }

  const pageUrl = `https://www.soccer-near-me.com/teams/${slug}`;
  const imgPos = team.imagePosition ?? 50;
  const heroPos = team.heroImagePosition ?? 50;
  const heroPhoto = team.imageUrl || team.teamPhoto || DEFAULT_HERO_PHOTO;
  const teamPhotos = team.photos && team.photos.length > 0 ? team.photos : DEFAULT_PHOTOS;
  const logo = team.logo || DEFAULT_LOGO;
  // undefined/null = never set → show default; "" = user cleared → no video
  const videoUrl = team.videoUrl === undefined || team.videoUrl === null ? DEFAULT_VIDEO : team.videoUrl || null;
  const practiceSet = new Set(
    (team.practiceSchedule || []).map((d) => d.trim().slice(0, 3).toLowerCase())
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[1100px] mx-auto px-6 py-3.5 text-sm text-muted flex items-center justify-between">
        <div>
          <a href="/teams" className="text-primary hover:underline">Teams</a>
          {" \u203A "}
          <span>{team.state}</span>
          {" \u203A "}
          <span>{team.name}</span>
        </div>
        <ManageListingButton ownerId={ownerId} listingType="team" listingId={team.id} />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 lg:gap-6 items-start">

          {/* ====== LEFT SIDEBAR (first in source for desktop, order-4 on mobile) ====== */}
          <aside className="order-4 lg:order-none lg:[grid-row:span_10] flex flex-col gap-4">

            {/* Photo + Team ID + Roster */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <img src={team.teamPhoto || DEFAULT_SIDEBAR_PHOTO} alt={team.name} className="w-full h-[200px] object-cover block" style={{ objectPosition: `center ${imgPos}%` }} />
              <div className="text-center py-3.5 px-4">
                <h3 className="text-[15px] font-bold text-primary leading-snug">{team.name}</h3>
                <p className="text-sm text-muted mt-1">{team.city}, {team.state}</p>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border gap-2.5">
                {team.lookingForPlayers && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full flex-1 text-center">
                    Roster spots available!
                  </span>
                )}
                <a
                  href={`/contact/team/${slug}`}
                  className="bg-[#DC373E] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors whitespace-nowrap"
                >
                  Contact
                </a>
              </div>
            </div>

            {/* Info Table */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {[
                { label: "Coach", value: team.coach },
                { label: "Age Group", value: team.ageGroup },
                { label: "Gender", value: team.gender },
                { label: "Level", value: team.level },
                { label: "League", value: team.season },
                ...(team.practiceSchedule && team.practiceSchedule.length > 0 ? [{ label: "Practice Days", value: team.practiceSchedule.join(", ") }] : []),
                ...(team.address ? [{ label: "Address", value: team.address }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center px-4 py-[11px] border-b border-border last:border-b-0 text-[13.5px]">
                  <span className="text-muted font-medium">{row.label}</span>
                  <span className="font-bold text-primary text-right">{row.value}</span>
                </div>
              ))}
              {team.socialMedia && (team.socialMedia.facebook || team.socialMedia.instagram) && (
                <div className="flex justify-center gap-4 py-3.5 border-t border-border">
                  {team.socialMedia.instagram && (
                    <a href={team.socialMedia.instagram} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Instagram">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                  )}
                  {team.socialMedia.facebook && (
                    <a href={team.socialMedia.facebook} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Facebook">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Details */}
            {(team.phone || team.address) && (
              <div className="bg-white rounded-2xl p-[18px] shadow-sm space-y-3.5">
                {team.phone && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone</p>
                    <p className="text-sm font-bold text-primary">{team.phone}</p>
                  </div>
                )}
                {team.address && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Location</p>
                    <p className="text-sm font-bold text-primary">{team.address}</p>
                  </div>
                )}
              </div>
            )}

            {/* Annual Tournaments */}
            {team.annualTournaments && team.annualTournaments.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h4 className="text-sm font-bold mb-2.5">Annual Tournaments</h4>
                <ul className="space-y-1.5">
                  {team.annualTournaments.map((t, i) => (
                    <li key={i} className="text-sm text-muted flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Share */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="text-sm font-bold mb-2.5">Share this profile!</h4>
              <ShareButtons url={pageUrl} title={team.name} />
            </div>
          </aside>

          {/* ====== Hero ====== */}
          <div className="order-1 lg:order-none lg:col-start-2 bg-white rounded-2xl overflow-hidden shadow-sm">
              <HeroImage src={heroPhoto} alt={team.name} id={team.id} imagePosition={heroPos} />
              <div className="p-5 sm:p-7 sm:flex sm:gap-6 sm:items-start">
              <img
                src={logo}
                alt={`${team.name} logo`}
                className="w-[56px] h-[56px] sm:w-[72px] sm:h-[72px] rounded-xl border-2 border-border object-contain shrink-0 p-1 sm:p-1.5 bg-surface -mt-8 sm:-mt-10 relative z-10"
              />
              <div className="mt-3 sm:mt-0 sm:flex-1 sm:min-w-0">
                <h1 className="text-xl sm:text-[26px] font-extrabold text-primary leading-tight tracking-tight">{team.name}</h1>
                <p className="text-sm text-muted mt-1.5 mb-3 font-medium">
                  {club ? <a href={`/clubs/${club.slug}`} className="text-muted hover:underline">{club.name}</a> : team.clubName}
                  {" \u00b7 "}{team.city}, {team.state}
                </p>
                {team.description && (
                  <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">{team.description}</p>
                )}
                <div className="flex gap-2.5 mt-[18px] flex-wrap">
                  {club && (
                    <a
                      href={`/clubs/${club.slug}`}
                      className="bg-white text-primary border-2 border-primary px-[22px] py-[11px] rounded-lg text-sm font-bold hover:bg-surface transition-colors"
                    >
                      View Club
                    </a>
                  )}
                  {club?.website && (
                    <a
                      href={club.website.startsWith("http") ? club.website : `https://${club.website}`}
                      target="_blank"
                      className="bg-white text-primary border-2 border-border px-[22px] py-[11px] rounded-lg text-sm font-bold hover:bg-surface transition-colors"
                    >
                      &#127760; Visit Website
                    </a>
                  )}
                  {team.lookingForPlayers && (
                    <a
                      href={`/contact/team/${slug}`}
                      className="bg-red-50 text-[#DC373E] border-2 border-red-200 px-[22px] py-[11px] rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                    >
                      &#128197; Tryout Info
                    </a>
                  )}
                </div>
              </div>
              </div>
          </div>

          {/* ====== Special Announcements ====== */}
          {(team.announcementText || team.announcementText2 || team.announcementText3) && (
            <div className="order-2 lg:order-none lg:col-start-2 space-y-4">
              {team.announcementText && <AnnouncementSection heading={team.announcementHeading} text={team.announcementText} image={team.announcementImage} />}
              {team.announcementText2 && <AnnouncementSection heading={team.announcementHeading2} text={team.announcementText2} image={team.announcementImage2} />}
              {team.announcementText3 && <AnnouncementSection heading={team.announcementHeading3} text={team.announcementText3} image={team.announcementImage3} />}
            </div>
          )}

          {/* ====== At a Glance ====== */}
          <div className={`${(team.announcementText || team.announcementText2 || team.announcementText3) ? "order-3" : "order-2"} lg:order-none lg:col-start-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm`}>
              <h3 className="text-[13px] sm:text-[15px] font-bold text-primary mb-2.5 sm:mb-3.5">At a Glance</h3>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 mt-1">
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="text-sm sm:text-lg leading-none">&#127942;</span>
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Level</span>
                  <span className="text-xs sm:text-sm font-bold text-primary ml-auto">{team.level}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="text-sm sm:text-lg leading-none">&#127941;</span>
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">League</span>
                  <span className="text-xs sm:text-sm font-bold text-primary ml-auto">{team.season || "—"}</span>
                </div>
                {team.events && team.events.some((e) => e.type === "Tryout") && (
                  <div className="flex items-center gap-1.5 sm:gap-2.5 col-span-2">
                    <span className="text-sm sm:text-lg leading-none">&#128197;</span>
                    <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Tryout Dates</span>
                    <span className="text-xs sm:text-sm font-bold text-primary ml-auto">
                      {team.events.filter((e) => e.type === "Tryout").map((e) => e.date).join(" & ")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="text-sm sm:text-lg leading-none">&#9917;</span>
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Practices</span>
                  <span className="text-xs sm:text-sm font-bold text-primary ml-auto">
                    {team.practiceSchedule && team.practiceSchedule.length > 0
                      ? `${team.practiceSchedule.length}x / week`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="text-sm sm:text-lg leading-none">&#128197;</span>
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Age</span>
                  <span className="text-xs sm:text-sm font-bold text-primary ml-auto">{team.ageGroup} {team.gender}</span>
                </div>
                {team.annualTournaments && team.annualTournaments.length > 0 && (
                  <div className="flex items-center gap-1.5 sm:gap-2.5">
                    <span className="text-sm sm:text-lg leading-none">&#129349;</span>
                    <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Tournaments</span>
                    <span className="text-xs sm:text-sm font-bold text-primary ml-auto">{team.annualTournaments.length}</span>
                  </div>
                )}
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
                <span>{team.address || `${team.city}, ${team.state}`}</span>
              </div>
          </div>

          {/* ====== Photos & Video ====== */}
          <div className="order-5 lg:order-none lg:col-start-2 bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-primary mb-3">Photos &amp; Video</h3>
              <div className={`grid grid-cols-2 gap-1.5 ${videoUrl ? "mb-3" : ""}`}>
                {teamPhotos.map((photo, i) => (
                  <img key={i} src={photo} alt={`Team photo ${i + 1}`} className="w-full aspect-[4/3] object-cover rounded-lg block" style={{ objectPosition: `center ${imgPos}%` }} />
                ))}
              </div>
              {videoUrl && <VideoEmbed url={videoUrl} />}
          </div>

          {/* ====== Media ====== */}
          {team.mediaLinks && team.mediaLinks.length > 0 && (
          <div className="order-5 lg:order-none lg:col-start-2 bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-primary mb-3">Media</h3>
              <div className="space-y-2">
                {team.mediaLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors group">
                    <span className="shrink-0">&#128279;</span>
                    <span className="group-hover:underline truncate">{link.title || link.url}</span>
                  </a>
                ))}
              </div>
          </div>
          )}

          {/* ====== Upcoming Events ====== */}
          <div className="order-6 lg:order-none lg:col-start-2 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[15px] font-bold text-primary mb-3.5">Upcoming Events</h3>
              {team.events && team.events.length > 0 ? (
                <div>
                  {team.events.map((ev, i) => {
                    const { month, day } = parseEventDate(ev.date);
                    return (
                      <div key={i} className="flex gap-4 py-3.5 border-b border-border last:border-b-0 last:pb-0 items-center">
                        <div className="bg-primary text-white rounded-xl py-2 px-3 text-center min-w-[52px] shrink-0">
                          <div className="text-[10px] font-bold uppercase tracking-wide opacity-80">{month}</div>
                          <div className="text-[22px] font-extrabold leading-tight">{day}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-primary mb-1">{ev.name}</h4>
                          <p className="text-sm text-muted">{ev.location || ""}</p>
                        </div>
                        {ev.type && (
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${EVENT_TYPE_COLORS[ev.type] || "bg-gray-100 text-gray-600"}`}>
                            {ev.type}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted">No upcoming events posted.</p>
              )}
          </div>

          {/* ====== Reviews ====== */}
          <div className="order-7 lg:order-none lg:col-start-2">
            <Suspense fallback={<div className="bg-white rounded-2xl p-6 shadow-sm"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" /><div className="h-20 bg-gray-200 rounded animate-pulse" /></div>}>
              <ReviewSection listingType="team" listingId={team.id} />
            </Suspense>
          </div>

          {/* ====== Similar Teams ====== */}
          {similarTeams.length > 0 && (
              <div className="order-8 lg:order-none lg:col-start-2 bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-[15px] font-bold text-primary mb-3.5">Similar Teams</h3>
                <div className="grid grid-cols-2 gap-3">
                  {similarTeams.map((t) => (
                    <a
                      key={t.id}
                      href={`/teams/${t.slug}`}
                      className="border-[1.5px] border-border rounded-xl p-3.5 no-underline hover:border-primary hover:shadow-md transition-all block"
                    >
                      <h4 className="text-[13px] font-bold text-primary mb-1.5 leading-snug">{t.name}</h4>
                      <div className="flex gap-2 flex-wrap">
                        <span className="bg-surface text-muted px-2 py-0.5 rounded-full text-[11px] font-semibold">{t.level}</span>
                        <span className="bg-surface text-muted px-2 py-0.5 rounded-full text-[11px] font-semibold">{t.gender}</span>
                        <span className="bg-surface text-muted px-2 py-0.5 rounded-full text-[11px] font-semibold">{t.city}, {t.state}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
          )}

          {/* ====== CTA Banner ====== */}
          <div className="order-9 lg:order-none lg:col-start-2 bg-primary rounded-2xl px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
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
