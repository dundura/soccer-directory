import { Suspense } from "react";
import { getTryoutBySlug, getTryoutSlugs, getListingOwner } from "@/lib/db";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { VideoEmbed, ShareButtons } from "@/components/profile-ui";
import { AnytimeInlineCTA } from "@/components/ui";
import { AnnouncementSection } from "@/components/announcement-section";
import { FeaturedArticles } from "@/components/featured-articles";
import { PhotoGrid } from "@/components/photo-grid";
import { ClickableImage } from "@/components/clickable-image";
import { ReviewSection } from "@/components/review-section";
import { HeroImage } from "@/components/hero-image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ContactTryoutForm } from "./contact-form";
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

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getTryoutSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tryout = await getTryoutBySlug(slug);
  if (!tryout) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${tryout.name} | Soccer Tryout in ${tryout.city}, ${tryout.state}`,
    tryout.description || `Soccer tryout in ${tryout.city}, ${tryout.state}`,
    tryout.imageUrl || tryout.teamPhoto || tryout.logo,
    `/tryouts/${slug}`,
  );
}

export default async function TryoutDetailPage({ params }: Props) {
  const { slug } = await params;

  let tryout;
  try {
    tryout = await getTryoutBySlug(slug);
  } catch {
    throw new Error("Failed to load tryout details. Please try again later.");
  }
  if (!tryout) notFound();

  let ownerId: string | null = null;
  try {
    ownerId = await getListingOwner("tryout", slug);
  } catch {
    ownerId = null;
  }

  const pageUrl = `https://www.soccer-near-me.com/tryouts/${slug}`;
  const imgPos = tryout.imagePosition ?? 50;
  const heroPos = tryout.heroImagePosition ?? 50;
  const heroPhoto = tryout.imageUrl || tryout.teamPhoto || DEFAULT_HERO_PHOTO;
  const tryoutPhotos = tryout.photos && tryout.photos.length > 0 ? tryout.photos : DEFAULT_PHOTOS;
  const logo = tryout.logo || DEFAULT_LOGO;
  const videoUrl = tryout.videoUrl === undefined || tryout.videoUrl === null ? DEFAULT_VIDEO : tryout.videoUrl || null;

  const hasAnnouncements =
    tryout.announcementHeading || tryout.announcementText || tryout.announcementImage ||
    tryout.announcementHeading2 || tryout.announcementText2 || tryout.announcementImage2 ||
    tryout.announcementHeading3 || tryout.announcementText3 || tryout.announcementImage3;

  function normalizeUrl(url?: string) {
    if (!url) return undefined;
    return url.startsWith("http") ? url : `https://${url}`;
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[1100px] mx-auto px-6 py-3.5 text-sm text-muted flex items-center justify-between">
        <div>
          <a href="/tryouts" className="text-primary hover:underline">Tryouts</a>
          {" \u203A "}
          <span>{tryout.state}</span>
          {" \u203A "}
          <span>{tryout.name}</span>
        </div>
        <ManageListingButton ownerId={ownerId} listingType="tryout" listingId={tryout.id} />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 lg:gap-6 items-start">

          {/* ====== LEFT SIDEBAR ====== */}
          <aside className="order-4 lg:order-none lg:[grid-row:span_10] flex flex-col gap-4">

            {/* Photo + Name + CTA */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <ClickableImage src={tryout.teamPhoto || DEFAULT_SIDEBAR_PHOTO} alt={tryout.name} className="w-full min-h-[150px] max-h-[280px] object-contain bg-surface block p-2" style={{ objectPosition: `center ${imgPos}%` }} />
              <div className="text-center py-3.5 px-4">
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight leading-snug">{tryout.name}</h3>
                {tryout.clubName && <p className="text-sm text-muted">{tryout.clubName}</p>}
                <p className="text-sm text-muted mt-1">{tryout.city}, {tryout.state}</p>
              </div>
              <div className="flex items-center justify-center px-4 py-2.5 border-t border-border gap-2.5">
                {tryout.registrationUrl ? (
                  <a
                    href={tryout.registrationUrl.startsWith("http") ? tryout.registrationUrl : `https://${tryout.registrationUrl}`}
                    target="_blank"
                    className="bg-[#DC373E] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors whitespace-nowrap"
                  >
                    Register &rarr;
                  </a>
                ) : (
                  <a
                    href="#contact"
                    className="bg-[#DC373E] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors whitespace-nowrap"
                  >
                    Contact
                  </a>
                )}
                {tryout.website && (
                  <a
                    href={tryout.website.startsWith("http") ? tryout.website : `https://${tryout.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-accent text-accent px-5 py-2 rounded-lg text-sm font-bold hover:bg-accent hover:text-white transition-colors whitespace-nowrap"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Info Table */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {[
                { label: "Type", value: tryout.tryoutType },
                { label: "Dates", value: tryout.dates },
                ...(tryout.time ? [{ label: "Time", value: tryout.time }] : []),
                { label: "Age Group", value: tryout.ageGroup },
                { label: "Gender", value: tryout.gender },
                ...(tryout.cost ? [{ label: "Cost", value: tryout.cost }] : []),
                { label: "Contact", value: tryout.organizerName },
                ...(tryout.clubName ? [{ label: "Club", value: tryout.clubName }] : []),
                ...(tryout.location ? [{ label: "Location", value: tryout.location }] : []),
                ...(tryout.address ? [{ label: "Address", value: tryout.address }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center px-4 py-[11px] border-b border-border last:border-b-0 text-[13.5px]">
                  <span className="text-muted font-medium">{row.label}</span>
                  <span className="font-bold text-primary text-right">{row.value}</span>
                </div>
              ))}
              {tryout.socialMedia && (tryout.socialMedia.facebook || tryout.socialMedia.instagram) && (
                <div className="flex justify-center gap-4 py-3.5 border-t border-border">
                  {tryout.socialMedia.instagram && (
                    <a href={tryout.socialMedia.instagram} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Instagram">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                  )}
                  {tryout.socialMedia.facebook && (
                    <a href={tryout.socialMedia.facebook} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Facebook">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Details */}
            {(tryout.phone || tryout.email) && (
              <div className="bg-white rounded-2xl p-[18px] shadow-sm space-y-3.5">
                {tryout.phone && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone</p>
                    <p className="text-sm font-bold text-primary">{tryout.phone}</p>
                  </div>
                )}
                {tryout.email && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email</p>
                    <a href="#contact" className="text-sm font-bold text-accent-hover hover:underline">Contact</a>
                  </div>
                )}
              </div>
            )}

            {/* Share */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="text-sm font-bold mb-2.5">Share this tryout!</h4>
              <ShareButtons url={pageUrl} title={tryout.name} />
            </div>

            {/* Our Posts */}
            <ListingPostsSidebar listingType="tryout" listingId={String(tryout.id)} slug={slug} ownerId={ownerId} />
          </aside>

          {/* ====== RIGHT MAIN COLUMN ====== */}

            {/* Hero */}
            <div className="order-1 lg:order-none lg:col-start-2 bg-white rounded-2xl overflow-hidden shadow-sm">
              <HeroImage src={heroPhoto} alt={tryout.name} id={tryout.id} imagePosition={heroPos} />
              <div className="p-5 sm:p-7 sm:flex sm:gap-6 sm:items-start">
                <img
                  src={logo}
                  alt={`${tryout.name} logo`}
                  className="w-[56px] h-[56px] sm:w-[72px] sm:h-[72px] rounded-xl border-2 border-border object-contain shrink-0 p-1.5 bg-surface -mt-8 sm:-mt-10 relative z-10 bg-white"
                />
                <div className="mt-3 sm:mt-0 sm:flex-1 sm:min-w-0 relative z-20">
                  <InlineEditField ownerId={ownerId} listingType="tryout" listingId={tryout.id} field="name" value={tryout.name} tag="h1" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase leading-tight tracking-tight" />
                  {tryout.tagline && (
                    <InlineEditField ownerId={ownerId} listingType="tryout" listingId={tryout.id} field="tagline" value={tryout.tagline} tag="p" className="text-sm text-accent font-medium mt-1" />
                  )}
                  <p className="text-sm text-muted mt-1.5 mb-3 font-medium">
                    {tryout.organizerName}
                    {tryout.clubName && <> {" \u00b7 "} {tryout.clubName}</>}
                    {" \u00b7 "} {tryout.city}, {tryout.state}
                  </p>
                  {tryout.description && (
                    <div className="mb-0">
                      <InlineEditField ownerId={ownerId} listingType="tryout" listingId={tryout.id} field="description" value={tryout.description} tag="p" className="text-sm leading-relaxed text-gray-500 whitespace-pre-line" multiline />
                    </div>
                  )}
                  <div className="flex gap-2.5 mt-[18px] flex-wrap">
                    {tryout.registrationUrl ? (
                      <a
                        href={tryout.registrationUrl.startsWith("http") ? tryout.registrationUrl : `https://${tryout.registrationUrl}`}
                        target="_blank"
                        className="bg-[#DC373E] text-white px-[22px] py-[11px] rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors"
                      >
                        Register &rarr;
                      </a>
                    ) : (
                      <a
                        href="#contact"
                        className="bg-[#DC373E] text-white px-[22px] py-[11px] rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors"
                      >
                        Contact Organizer
                      </a>
                    )}
                    {tryout.website && (
                      <a
                        href={tryout.website.startsWith("http") ? tryout.website : `https://${tryout.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-accent text-accent px-[22px] py-[11px] rounded-lg text-sm font-bold hover:bg-accent hover:text-white transition-colors"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Special Announcements */}
            {hasAnnouncements && (
              <div className="order-2 lg:order-none lg:col-start-2 space-y-4">
                {(tryout.announcementHeading || tryout.announcementText || tryout.announcementImage) && (
                  <AnnouncementSection heading={tryout.announcementHeading} text={tryout.announcementText} image={tryout.announcementImage} ctaUrl={normalizeUrl(tryout.announcementCtaUrl || tryout.website)} ctaLabel={tryout.announcementCta || "Learn More →"} />
                )}
                {(tryout.announcementHeading2 || tryout.announcementText2 || tryout.announcementImage2) && (
                  <AnnouncementSection heading={tryout.announcementHeading2} text={tryout.announcementText2} image={tryout.announcementImage2} ctaUrl={normalizeUrl(tryout.announcementCtaUrl2 || tryout.website)} ctaLabel={tryout.announcementCta2 || "Learn More →"} />
                )}
                {(tryout.announcementHeading3 || tryout.announcementText3 || tryout.announcementImage3) && (
                  <AnnouncementSection heading={tryout.announcementHeading3} text={tryout.announcementText3} image={tryout.announcementImage3} ctaUrl={normalizeUrl(tryout.announcementCtaUrl3 || tryout.website)} ctaLabel={tryout.announcementCta3 || "Learn More →"} />
                )}
              </div>
            )}

            {/* At a Glance */}
            <div className={`${hasAnnouncements ? "order-3" : "order-2"} lg:order-none lg:col-start-2 bg-white rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">At a Glance</h3>
                <EditSectionLink ownerId={ownerId} listingType="tryout" listingId={tryout.id} />
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#127939;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Type</span>
                  <span className="text-sm font-bold text-primary ml-auto">{tryout.tryoutType}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#128197;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Dates</span>
                  <span className="text-sm font-bold text-primary ml-auto">{tryout.dates}</span>
                </div>
                {tryout.time && (
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">&#128336;</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Time</span>
                    <span className="text-sm font-bold text-primary ml-auto">{tryout.time}</span>
                  </div>
                )}
                {tryout.cost && (
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">&#128176;</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Cost</span>
                    <span className="text-sm font-bold text-primary ml-auto">{tryout.cost}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#127874;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Ages</span>
                  <span className="text-sm font-bold text-primary ml-auto">{tryout.ageGroup}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#9917;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Gender</span>
                  <span className="text-sm font-bold text-primary ml-auto">{tryout.gender}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#128205;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Location</span>
                  <span className="text-sm font-bold text-primary ml-auto">{tryout.location || `${tryout.city}, ${tryout.state}`}</span>
                </div>
              </div>
            </div>

            {/* Photos & Video */}
            <div className="order-5 lg:order-none lg:col-start-2 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">Photos &amp; Video</h3>
                <EditSectionLink ownerId={ownerId} listingType="tryout" listingId={tryout.id} />
              </div>
              <div className={`grid grid-cols-2 gap-2.5 ${videoUrl ? "mb-4" : ""}`}>
                <PhotoGrid photos={tryoutPhotos} alt="Tryout photo" />
              </div>
              {videoUrl && <VideoEmbed url={videoUrl} />}
            </div>

            <div className="order-6 lg:order-none lg:col-start-2">
              <FeaturedArticles />
            </div>

            {/* Contact Form */}
            <div id="contact" className="order-7 lg:order-none lg:col-start-2 bg-white rounded-2xl border-2 border-accent/20 p-6">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-extrabold text-primary uppercase tracking-tight mb-1">Contact Organizer</h2>
              <p className="text-muted text-sm mb-5">Have questions about this tryout? Send a message to the organizer.</p>
              <ContactTryoutForm tryoutName={tryout.name} slug={slug} />
            </div>

            {/* Reviews */}
            <div className="order-8 lg:order-none lg:col-start-2">
              <Suspense fallback={<div className="bg-white rounded-2xl p-6 shadow-sm"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" /><div className="h-20 bg-gray-200 rounded animate-pulse" /></div>}>
                <ReviewSection listingType="tryout" listingId={tryout.id} />
              </Suspense>
            </div>

            {/* ====== Sponsors ====== */}
            {tryout.sponsors && tryout.sponsors.length > 0 && (
              <div className="order-9 lg:order-none lg:col-start-2">
                <SponsorsSection sponsors={tryout.sponsors} />
              </div>
            )}

            <div className="order-10 lg:order-none lg:col-start-2">
              <AnytimeInlineCTA />
            </div>
        </div>
      </div>
    </>
  );
}
