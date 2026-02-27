import { Suspense } from "react";
import { getCampBySlug, getCampSlugs, getListingOwner } from "@/lib/db";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, ShareButtons } from "@/components/profile-ui";
import { ReviewSection } from "@/components/review-section";
import { HeroImage } from "@/components/hero-image";
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

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getCampSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const camp = await getCampBySlug(slug);
  if (!camp) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${camp.name} | Soccer Camp in ${camp.city}, ${camp.state}`,
    camp.description || `Soccer camp in ${camp.city}, ${camp.state}`,
    camp.imageUrl || camp.teamPhoto || camp.logo,
    `/camps/${slug}`,
  );
}

export default async function CampDetailPage({ params }: Props) {
  const { slug } = await params;

  let camp;
  try {
    camp = await getCampBySlug(slug);
  } catch {
    throw new Error("Failed to load camp details. Please try again later.");
  }
  if (!camp) notFound();

  let ownerId: string | null = null;
  try {
    ownerId = await getListingOwner("camp", slug);
  } catch {
    ownerId = null;
  }

  const pageUrl = `https://www.soccer-near-me.com/camps/${slug}`;
  const imgPos = camp.imagePosition ?? 50;
  const heroPhoto = camp.imageUrl || camp.teamPhoto || DEFAULT_HERO_PHOTO;
  const campPhotos = camp.photos && camp.photos.length > 0 ? camp.photos : DEFAULT_PHOTOS;
  const logo = camp.logo || DEFAULT_LOGO;
  const videoUrl = camp.videoUrl === undefined || camp.videoUrl === null ? DEFAULT_VIDEO : camp.videoUrl || null;

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[1100px] mx-auto px-6 py-3.5 text-sm text-muted flex items-center justify-between">
        <div>
          <a href="/camps" className="text-primary hover:underline">Camps</a>
          {" \u203A "}
          <span>{camp.state}</span>
          {" \u203A "}
          <span>{camp.name}</span>
        </div>
        <ManageListingButton ownerId={ownerId} listingType="camp" listingId={camp.id} />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">

          {/* ====== LEFT SIDEBAR ====== */}
          <aside className="flex flex-col gap-4 order-2 lg:order-1">

            {/* Photo + Name + CTA */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <img src={camp.teamPhoto || DEFAULT_SIDEBAR_PHOTO} alt={camp.name} className="w-full h-[200px] object-cover block" style={{ objectPosition: `center ${imgPos}%` }} />
              <div className="text-center py-3.5 px-4">
                <h3 className="text-[15px] font-bold text-primary leading-snug">{camp.name}</h3>
                <p className="text-sm text-muted mt-1">{camp.city}, {camp.state}</p>
              </div>
              <div className="flex items-center justify-center px-4 py-2.5 border-t border-border gap-2.5">
                {camp.registrationUrl ? (
                  <a
                    href={camp.registrationUrl}
                    target="_blank"
                    className="bg-[#DC373E] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors whitespace-nowrap"
                  >
                    Register &rarr;
                  </a>
                ) : (
                  <a
                    href={`/contact/camp/${slug}`}
                    className="bg-[#DC373E] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors whitespace-nowrap"
                  >
                    Contact
                  </a>
                )}
              </div>
            </div>

            {/* Info Table */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {[
                { label: "Camp Type", value: camp.campType },
                { label: "Dates", value: camp.dates },
                { label: "Price", value: camp.price },
                { label: "Ages", value: camp.ageRange },
                { label: "Gender", value: camp.gender },
                { label: "Organizer", value: camp.organizerName },
                ...(camp.location ? [{ label: "Location", value: camp.location }] : []),
                ...(camp.address ? [{ label: "Address", value: camp.address }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center px-4 py-[11px] border-b border-border last:border-b-0 text-[13.5px]">
                  <span className="text-muted font-medium">{row.label}</span>
                  <span className="font-bold text-primary text-right">{row.value}</span>
                </div>
              ))}
              {camp.socialMedia && (camp.socialMedia.facebook || camp.socialMedia.instagram) && (
                <div className="flex justify-center gap-4 py-3.5 border-t border-border">
                  {camp.socialMedia.instagram && (
                    <a href={camp.socialMedia.instagram} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Instagram">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                  )}
                  {camp.socialMedia.facebook && (
                    <a href={camp.socialMedia.facebook} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Facebook">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Details */}
            {(camp.phone || camp.email) && (
              <div className="bg-white rounded-2xl p-[18px] shadow-sm space-y-3.5">
                {camp.phone && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone</p>
                    <p className="text-sm font-bold text-primary">{camp.phone}</p>
                  </div>
                )}
                {camp.email && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email</p>
                    <a href={`mailto:${camp.email}`} className="text-sm font-bold text-accent-hover hover:underline">{camp.email}</a>
                  </div>
                )}
              </div>
            )}

            {/* Share */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="text-sm font-bold mb-2.5">Share this camp!</h4>
              <ShareButtons url={pageUrl} title={camp.name} />
            </div>
          </aside>

          {/* ====== RIGHT MAIN COLUMN ====== */}
          <main className="flex flex-col gap-5 order-1 lg:order-2">

            {/* Hero */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <HeroImage src={heroPhoto} alt={camp.name} id={camp.id} imagePosition={camp.imagePosition} />
              <div className="p-7 flex gap-6 items-start">
                <img
                  src={logo}
                  alt={`${camp.name} logo`}
                  className="w-[72px] h-[72px] rounded-xl border-2 border-border object-contain shrink-0 p-1.5 bg-surface -mt-16 relative z-10"
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-[26px] font-extrabold text-primary leading-tight tracking-tight">{camp.name}</h1>
                  <p className="text-sm text-muted mt-1.5 mb-3 font-medium">
                    {camp.organizerName} {" \u00b7 "} {camp.city}, {camp.state}
                  </p>
                  {camp.description && (
                    <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">{camp.description}</p>
                  )}
                  <div className="flex gap-2.5 mt-[18px] flex-wrap">
                    {camp.registrationUrl ? (
                      <a
                        href={camp.registrationUrl}
                        target="_blank"
                        className="bg-[#DC373E] text-white px-[22px] py-[11px] rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors"
                      >
                        Register &rarr;
                      </a>
                    ) : (
                      <a
                        href={`/contact/camp/${slug}`}
                        className="bg-[#DC373E] text-white px-[22px] py-[11px] rounded-lg text-sm font-bold hover:bg-[#C42F36] transition-colors"
                      >
                        Contact Organizer
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* At a Glance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[15px] font-bold text-primary mb-3.5">At a Glance</h3>
              <div className="grid grid-cols-2 gap-2.5 mt-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#127939;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Type</span>
                  <span className="text-sm font-bold text-primary ml-auto">{camp.campType}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#128197;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Dates</span>
                  <span className="text-sm font-bold text-primary ml-auto">{camp.dates}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#128176;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Price</span>
                  <span className="text-sm font-bold text-primary ml-auto">{camp.price}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#127874;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Ages</span>
                  <span className="text-sm font-bold text-primary ml-auto">{camp.ageRange}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#9917;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Gender</span>
                  <span className="text-sm font-bold text-primary ml-auto">{camp.gender}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">&#128205;</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Location</span>
                  <span className="text-sm font-bold text-primary ml-auto">{camp.location || `${camp.city}, ${camp.state}`}</span>
                </div>
              </div>
            </div>

            {/* Photos & Video */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[15px] font-bold text-primary mb-3.5">Photos &amp; Video</h3>
              <div className={`grid grid-cols-2 gap-2.5 ${videoUrl ? "mb-4" : ""}`}>
                {campPhotos.map((photo, i) => (
                  <img key={i} src={photo} alt={`Camp photo ${i + 1}`} className="w-full aspect-square object-contain rounded-xl block bg-surface" />
                ))}
              </div>
              {videoUrl && <VideoEmbed url={videoUrl} />}
            </div>

            {/* Reviews */}
            <Suspense fallback={<div className="bg-white rounded-2xl p-6 shadow-sm"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" /><div className="h-20 bg-gray-200 rounded animate-pulse" /></div>}>
              <ReviewSection listingType="camp" listingId={camp.id} />
            </Suspense>

            {/* CTA Banner */}
            <div className="bg-primary rounded-2xl px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6 mt-2">
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

          </main>
        </div>
      </div>
    </>
  );
}
