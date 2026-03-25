import { getScrimmageBySlug, getScrimmageSlugs, getListingOwner } from "@/lib/db";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { VideoEmbed, ShareButtons } from "@/components/profile-ui";
import { AnytimeInlineCTA } from "@/components/ui";
import { FeaturedArticles } from "@/components/featured-articles";
import { ReviewSection } from "@/components/review-section";
import { HeroImage } from "@/components/hero-image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SponsorsSection } from "@/components/sponsors-section";
import { ListingPostsSidebar } from "@/components/listing-posts";

export const dynamic = "force-dynamic";

const DEFAULT_HERO_PHOTO = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecln_boys.jpg";
const DEFAULT_LOGO = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ast_logo_shield_only_blue.png";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getScrimmageSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getScrimmageBySlug(slug);
  if (!s) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${s.teamName} | Scrimmage in ${s.city}, ${s.state}`,
    s.description || `${s.level} ${s.ageGroup} ${s.gender} team ${s.availability.toLowerCase()} in ${s.city}, ${s.state}`,
    s.imageUrl || s.teamPhoto || s.logo,
    `/scrimmages/${slug}`,
  );
}

export default async function ScrimmageDetailPage({ params }: Props) {
  const { slug } = await params;
  const s = await getScrimmageBySlug(slug);
  if (!s) notFound();
  const ownerId = await getListingOwner("scrimmage", slug);

  const pageUrl = `https://www.soccer-near-me.com/scrimmages/${slug}`;
  const heroPhoto = s.imageUrl || s.teamPhoto || DEFAULT_HERO_PHOTO;
  const logo = s.logo || DEFAULT_LOGO;
  const videoUrl = s.videoUrl === undefined || s.videoUrl === null ? null : s.videoUrl || null;

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[1100px] mx-auto px-6 py-3.5 text-sm text-muted flex items-center justify-between">
        <div>
          <a href="/scrimmages" className="text-primary hover:underline">Scrimmages</a>
          {" \u203A "}
          <span>{s.state}</span>
          {" \u203A "}
          <span>{s.teamName}</span>
        </div>
        <ManageListingButton ownerId={ownerId} listingType="scrimmage" listingId={s.id} />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">

          {/* ====== LEFT SIDEBAR ====== */}
          <aside className="flex flex-col gap-4 order-2 lg:order-1">

            {/* Photo + Contact */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <img src={s.teamPhoto || heroPhoto} alt={s.teamName} className="w-full h-[200px] object-cover block" />
              <div className="text-center py-3.5 px-4">
                <h3 className="text-[15px] font-bold text-primary leading-snug">{s.teamName}</h3>
                <p className="text-sm text-muted mt-1">{s.city}, {s.state}</p>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border gap-2.5">
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full flex-1 text-center">
                  {s.availability}
                </span>
                <a
                  href={`/contact/scrimmage/${slug}`}
                  className="bg-[#DC373E] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors whitespace-nowrap"
                >
                  Contact Us
                </a>
              </div>
            </div>

            {/* Info Table */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {[
                { label: "Age Group", value: s.ageGroup },
                { label: "Gender", value: s.gender },
                { label: "Level", value: s.level },
                { label: "Status", value: s.availability },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center px-4 py-[11px] border-b border-border last:border-b-0 text-[13.5px]">
                  <span className="text-muted font-medium">{row.label}</span>
                  <span className="font-bold text-primary text-right">{row.value}</span>
                </div>
              ))}
              {s.socialMedia && (s.socialMedia.facebook || s.socialMedia.instagram) && (
                <div className="flex justify-center gap-4 py-3.5 border-t border-border">
                  {s.socialMedia.instagram && (
                    <a href={s.socialMedia.instagram} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Instagram">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                  )}
                  {s.socialMedia.facebook && (
                    <a href={s.socialMedia.facebook} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Facebook">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Contact Details */}
            {s.phone && (
              <div className="bg-white rounded-2xl p-[18px] shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone</p>
                <p className="text-sm font-bold text-primary">{s.phone}</p>
              </div>
            )}

            {/* Share */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="text-sm font-bold mb-2.5">Share this listing!</h4>
              <ShareButtons url={pageUrl} title={s.teamName} />
            </div>

            {/* Our Posts */}
            <ListingPostsSidebar listingType="scrimmage" listingId={String(s.id)} slug={slug} ownerId={ownerId} />
          </aside>

          {/* ====== RIGHT MAIN COLUMN ====== */}
          <main className="flex flex-col gap-5 order-1 lg:order-2">

            {/* Hero */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <HeroImage src={heroPhoto} alt={s.teamName} id={s.id} />
              <div className="p-7 flex gap-6 items-start">
              <img
                src={logo}
                alt={`${s.teamName} logo`}
                className="w-[72px] h-[72px] rounded-xl border-2 border-border object-contain shrink-0 p-1.5 bg-surface -mt-16 relative z-10"
              />
              <div className="flex-1 min-w-0">
                <InlineEditField ownerId={ownerId} listingType="scrimmage" listingId={s.id} field="name" value={s.teamName} tag="h1" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase leading-tight tracking-tight" />
                {s.tagline && (
                  <InlineEditField ownerId={ownerId} listingType="scrimmage" listingId={s.id} field="tagline" value={s.tagline} tag="p" className="text-sm text-accent font-medium mt-1" />
                )}
                <p className="text-sm text-muted mt-1.5 mb-3 font-medium">
                  {s.city}, {s.state}
                </p>
                {s.description && (
                  <InlineEditField ownerId={ownerId} listingType="scrimmage" listingId={s.id} field="description" value={s.description} tag="p" className="text-sm leading-relaxed text-gray-500 whitespace-pre-line" multiline />
                )}
                <div className="flex gap-2.5 mt-[18px] flex-wrap">
                  <a
                    href={`/contact/scrimmage/${slug}`}
                    className="bg-[#DC373E] text-white px-[22px] py-[11px] rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
              </div>
            </div>

            {/* At a Glance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-[15px] font-bold text-primary">At a Glance</h3>
                <EditSectionLink ownerId={ownerId} listingType="scrimmage" listingId={s.id} />
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#127942;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Level</span>
                  <span className="text-sm font-bold text-primary ml-auto">{s.level}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#128197;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Age Group</span>
                  <span className="text-sm font-bold text-primary ml-auto">{s.ageGroup}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#9917;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Gender</span>
                  <span className="text-sm font-bold text-primary ml-auto">{s.gender}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#9989;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</span>
                  <span className="text-sm font-bold text-green-600 ml-auto">{s.availability}</span>
                </div>
              </div>
            </div>

            {/* Video */}
            {videoUrl && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-[15px] font-bold text-primary">Video</h3>
                  <EditSectionLink ownerId={ownerId} listingType="scrimmage" listingId={s.id} />
                </div>
                <VideoEmbed url={videoUrl} />
              </div>
            )}

            <FeaturedArticles />

            {/* Sponsors */}
            {s.sponsors && s.sponsors.length > 0 && (
              <div className="order-8 lg:order-none lg:col-start-2">
                <SponsorsSection sponsors={s.sponsors} />
              </div>
            )}

            {/* Reviews */}
            <ReviewSection listingType="scrimmage" listingId={s.id} />

            <AnytimeInlineCTA />

          </main>
        </div>
      </div>
    </>
  );
}
