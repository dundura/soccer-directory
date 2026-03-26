import { Suspense } from "react";
import { getRecruiterBySlug, getRecruiterSlugs, getListingOwner } from "@/lib/db";
import { FeaturedArticles } from "@/components/featured-articles";
import { PhotoGrid } from "@/components/photo-grid";
import { ClickableImage } from "@/components/clickable-image";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { VideoEmbed, ShareButtons } from "@/components/profile-ui";
import { ReviewSection } from "@/components/review-section";
import { HeroImage } from "@/components/hero-image";
import { AnytimeInlineCTA } from "@/components/ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SponsorsSection } from "@/components/sponsors-section";
import { ListingPostsSidebar } from "@/components/listing-posts";

export const dynamic = "force-dynamic";

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
    const slugs = await getRecruiterSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recruiter = await getRecruiterBySlug(slug);
  if (!recruiter) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${recruiter.name} | College Recruiting Advisor in ${recruiter.city}, ${recruiter.state}`,
    recruiter.description || `${recruiter.specialty} recruiting advisor in ${recruiter.serviceArea}`,
    recruiter.imageUrl || recruiter.teamPhoto || recruiter.logo,
    `/college-recruiting/${slug}`,
  );
}

export default async function RecruiterDetailPage({ params }: Props) {
  const { slug } = await params;

  let recruiter;
  try {
    recruiter = await getRecruiterBySlug(slug);
  } catch {
    throw new Error("Failed to load advisor details. Please try again later.");
  }
  if (!recruiter) notFound();

  let ownerId: string | null = null;
  try {
    ownerId = await getListingOwner("recruiter", slug);
  } catch {
    ownerId = null;
  }

  const pageUrl = `https://www.soccer-near-me.com/college-recruiting/${slug}`;
  const imgPos = recruiter.imagePosition ?? 50;
  const heroPos = recruiter.heroImagePosition ?? 50;
  const heroPhoto = recruiter.imageUrl || recruiter.teamPhoto || DEFAULT_HERO_PHOTO;
  const recruiterPhotos = recruiter.photos && recruiter.photos.length > 0 ? recruiter.photos : DEFAULT_PHOTOS;
  const logo = recruiter.logo || DEFAULT_LOGO;
  const videoUrl = recruiter.videoUrl === undefined || recruiter.videoUrl === null ? DEFAULT_VIDEO : recruiter.videoUrl || null;
  const availabilitySet = new Set(
    (recruiter.practiceSchedule || []).map((d) => d.trim().slice(0, 3).toLowerCase())
  );

  const sidebarContent = (
    <>
      {/* Photo + Name + Contact */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <ClickableImage src={recruiter.teamPhoto || DEFAULT_SIDEBAR_PHOTO} alt={recruiter.name} className="w-full min-h-[150px] max-h-[280px] object-contain bg-surface block p-2" style={{ objectPosition: `center ${imgPos}%` }} />
        <div className="text-center py-3.5 px-4">
          <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight leading-snug">{recruiter.name}</h3>
          <p className="text-sm text-muted mt-1">{recruiter.city}, {recruiter.state}</p>
        </div>
        <div className="flex items-center justify-center px-4 py-2.5 border-t border-border gap-2.5">
          <a
            href={`/contact/recruiter/${slug}`}
            className="bg-[#DC373E] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors whitespace-nowrap"
          >
            Contact
          </a>
        </div>
      </div>

      {/* Info Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {[
          { label: "Specialty", value: recruiter.specialty },
          { label: "Pricing", value: recruiter.priceRange },
          { label: "Service Area", value: recruiter.serviceArea },
          ...(recruiter.practiceSchedule && recruiter.practiceSchedule.length > 0 ? [{ label: "Available Days", value: recruiter.practiceSchedule.join(", ") }] : []),
          ...(recruiter.address ? [{ label: "Address", value: recruiter.address }] : []),
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-start px-4 py-[11px] border-b border-border last:border-b-0 text-[13.5px]">
            <span className="text-muted font-medium shrink-0 mr-3">{row.label}</span>
            <span className="font-bold text-primary text-right max-w-[60%] break-words leading-snug">{row.value}</span>
          </div>
        ))}
        {recruiter.socialMedia && (recruiter.socialMedia.facebook || recruiter.socialMedia.instagram) && (
          <div className="flex justify-center gap-4 py-3.5 border-t border-border">
            {recruiter.socialMedia.instagram && (
              <a href={recruiter.socialMedia.instagram} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            )}
            {recruiter.socialMedia.facebook && (
              <a href={recruiter.socialMedia.facebook} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      {(recruiter.phone || recruiter.email || recruiter.address) && (
        <div className="bg-white rounded-2xl p-[18px] shadow-sm space-y-3.5">
          {recruiter.phone && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone</p>
              <p className="text-sm font-bold text-primary">{recruiter.phone}</p>
            </div>
          )}
          {recruiter.email && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email</p>
              <a href={`/contact/recruiter/${slug}`} className="text-sm font-bold text-accent-hover hover:underline">Contact</a>
            </div>
          )}
          {recruiter.address && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Location</p>
              <p className="text-sm font-bold text-primary">{recruiter.address}</p>
            </div>
          )}
        </div>
      )}

      {/* Share */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h4 className="text-sm font-bold mb-2.5">Share this profile!</h4>
        <ShareButtons url={pageUrl} title={recruiter.name} />
      </div>

      {/* Our Posts */}
      <ListingPostsSidebar listingType="recruiter" listingId={String(recruiter.id)} slug={slug} ownerId={ownerId} />
    </>
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[1100px] mx-auto px-6 py-3.5 text-sm text-muted flex items-center justify-between">
        <div>
          <a href="/college-recruiting" className="text-primary hover:underline">College Recruiting</a>
          {" \u203A "}
          <span>{recruiter.state}</span>
          {" \u203A "}
          <span>{recruiter.name}</span>
        </div>
        <ManageListingButton ownerId={ownerId} listingType="recruiter" listingId={recruiter.id} />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 lg:gap-6 items-start">

          {/* ====== LEFT SIDEBAR (desktop only) ====== */}
          <aside className="hidden lg:flex flex-col gap-4">
            {sidebarContent}
          </aside>

          {/* ====== RIGHT MAIN COLUMN ====== */}
          <main className="flex flex-col gap-5">

            {/* Hero */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <HeroImage src={heroPhoto} alt={recruiter.name} id={recruiter.id} imagePosition={heroPos} />
              <div className="p-5 sm:p-7">
                <img
                  src={logo}
                  alt={`${recruiter.name} logo`}
                  className="w-[56px] h-[56px] sm:w-[72px] sm:h-[72px] rounded-xl border-2 border-border object-contain shrink-0 p-1 sm:p-1.5 bg-surface -mt-8 sm:-mt-10 relative z-10 mb-4"
                />
                <div>
                  <InlineEditField ownerId={ownerId} listingType="recruiter" listingId={recruiter.id} field="name" value={recruiter.name} tag="h1" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase leading-tight tracking-tight" />
                  {recruiter.tagline && (
                    <InlineEditField ownerId={ownerId} listingType="recruiter" listingId={recruiter.id} field="tagline" value={recruiter.tagline} tag="p" className="text-sm text-accent font-medium mt-1" />
                  )}
                  <p className="text-sm text-muted mt-1.5 mb-3 font-medium">
                    {recruiter.specialty} {" \u00b7 "} {recruiter.city}, {recruiter.state}
                  </p>
                  {recruiter.description && (
                    <div className="mb-0">
                      <InlineEditField ownerId={ownerId} listingType="recruiter" listingId={recruiter.id} field="description" value={recruiter.description} tag="p" className="text-sm leading-relaxed text-gray-500 whitespace-pre-line" multiline />
                    </div>
                  )}
                  <div className="flex gap-2.5 mt-[18px] flex-wrap">
                    <a
                      href={`/contact/recruiter/${slug}`}
                      className="bg-[#DC373E] text-white px-[22px] py-[11px] rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors"
                    >
                      Contact Advisor
                    </a>
                    {recruiter.website && (
                      <a
                        href={recruiter.website.startsWith("http") ? recruiter.website : `https://${recruiter.website}`}
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

            {/* At a Glance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">At a Glance</h3>
                <EditSectionLink ownerId={ownerId} listingType="recruiter" listingId={recruiter.id} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-surface rounded-xl p-3.5 text-center">
                  <span className="text-xl leading-none block mb-1.5">&#127891;</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Specialty</p>
                  <p className="text-sm font-bold text-primary leading-snug">{recruiter.specialty}</p>
                </div>
                <div className="bg-surface rounded-xl p-3.5 text-center">
                  <span className="text-xl leading-none block mb-1.5">&#128176;</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Pricing</p>
                  <p className="text-sm font-bold text-primary leading-snug">{recruiter.priceRange}</p>
                </div>
                <div className="bg-surface rounded-xl p-3.5 text-center">
                  <span className="text-xl leading-none block mb-1.5">&#128205;</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Service Area</p>
                  <p className="text-sm font-bold text-primary leading-snug">{recruiter.serviceArea}</p>
                </div>
                {recruiter.rating > 0 ? (
                  <div className="bg-surface rounded-xl p-3.5 text-center">
                    <span className="text-xl leading-none block mb-1.5">&#11088;</span>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Rating</p>
                    <p className="text-sm font-bold text-primary leading-snug">{recruiter.rating} ({recruiter.reviewCount})</p>
                  </div>
                ) : (
                  <div className="bg-surface rounded-xl p-3.5 text-center">
                    <span className="text-xl leading-none block mb-1.5">&#128205;</span>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Location</p>
                    <p className="text-sm font-bold text-primary leading-snug">{recruiter.city}, {recruiter.state}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile sidebar - shown only on mobile, right after At a Glance */}
            <div className="flex flex-col gap-4 lg:hidden">
              {sidebarContent}
            </div>

            {/* Background & Credentials */}
            {(recruiter.experience || recruiter.credentials) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight mb-4">Background &amp; Credentials</h3>
                <div className="space-y-4">
                  {recruiter.experience && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Experience</p>
                      <InlineEditField ownerId={ownerId} listingType="recruiter" listingId={recruiter.id} field="experience" value={recruiter.experience} tag="p" className="text-sm text-primary leading-relaxed whitespace-pre-line" multiline />
                    </div>
                  )}
                  {recruiter.credentials && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Credentials</p>
                      <InlineEditField ownerId={ownerId} listingType="recruiter" listingId={recruiter.id} field="credentials" value={recruiter.credentials} tag="p" className="text-sm text-primary leading-relaxed whitespace-pre-line" multiline />
                    </div>
                  )}
                </div>
              </div>
            )}

            <FeaturedArticles />

            {/* Availability Schedule */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">Availability</h3>
                <EditSectionLink ownerId={ownerId} listingType="recruiter" listingId={recruiter.id} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {ALL_DAYS.map((day) => (
                  <span
                    key={day}
                    className={`px-3.5 py-[7px] rounded-full text-sm font-semibold ${
                      availabilitySet.has(day.toLowerCase())
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
                <span>{recruiter.address || recruiter.serviceArea || `${recruiter.city}, ${recruiter.state}`}</span>
              </div>
            </div>

            {/* Photos & Video */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">Photos &amp; Video</h3>
                <EditSectionLink ownerId={ownerId} listingType="recruiter" listingId={recruiter.id} />
              </div>
              <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2.5 ${videoUrl ? "mb-4" : ""}`}>
                <PhotoGrid photos={recruiterPhotos} alt="Recruiter photo" />
              </div>
              {videoUrl && <VideoEmbed url={videoUrl} />}
            </div>

            {/* Reviews */}
            <Suspense fallback={<div className="bg-white rounded-2xl p-6 shadow-sm"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" /><div className="h-20 bg-gray-200 rounded animate-pulse" /></div>}>
              <ReviewSection listingType="recruiter" listingId={recruiter.id} />
            </Suspense>

            {/* ====== Sponsors ====== */}
            {recruiter.sponsors && recruiter.sponsors.length > 0 && (
              <div className="order-8 lg:order-none lg:col-start-2">
                <SponsorsSection sponsors={recruiter.sponsors} />
              </div>
            )}

            <AnytimeInlineCTA />

          </main>
        </div>
      </div>
    </>
  );
}
