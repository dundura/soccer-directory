import { Suspense } from "react";
import { getSoccerBookBySlug, getSoccerBookSlugs, getListingOwner } from "@/lib/db";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { VideoEmbed, ShareButtons } from "@/components/profile-ui";
import { AnytimeInlineCTA } from "@/components/ui";
import { FeaturedArticles } from "@/components/featured-articles";
import { PhotoGrid } from "@/components/photo-grid";
import { ListingPostsSidebar } from "@/components/listing-posts";
import { ReviewSection } from "@/components/review-section";
import { AnnouncementSection } from "@/components/announcement-section";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SponsorsSection } from "@/components/sponsors-section";

export const dynamic = "force-dynamic";

function normalizeUrl(url?: string) { return url ? (url.startsWith("http") ? url : `https://${url}`) : undefined; }
const DEFAULT_IMAGE = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getSoccerBookSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getSoccerBookBySlug(slug);
  if (!service) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${service.name} | Books & Authors | Soccer Near Me`,
    service.description || `${service.category} by ${service.author}`,
    service.imageUrl,
    `/books-and-authors/${slug}`,
  );
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  let service;
  try {
    service = await getSoccerBookBySlug(slug);
  } catch {
    throw new Error("Failed to load service details. Please try again later.");
  }
  if (!service) notFound();

  let ownerId: string | null = null;
  try {
    ownerId = await getListingOwner("soccerbook", slug);
  } catch {
    ownerId = null;
  }

  const pageUrl = `https://www.soccer-near-me.com/books-and-authors/${slug}`;
  const image = service.imageUrl || DEFAULT_IMAGE;
  let photos: string[] = [];
  if (service.photos && service.photos.length > 0) {
    photos = service.photos;
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 py-3.5 text-sm text-muted flex items-center justify-between">
        <div>
          <a href="/books-and-authors" className="text-primary hover:underline">Products &amp; Books & Authors</a>
          {" \u203A "}
          <span>{service.category}</span>
          {" \u203A "}
          <span>{service.name}</span>
        </div>
        <ManageListingButton ownerId={ownerId} listingType="soccerbook" listingId={service.id} />
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Product Image */}
          <div className="bg-surface flex items-center justify-center p-8">
            <img
              src={image}
              alt={service.name}
              className="max-h-[400px] w-auto object-contain rounded-xl"
            />
          </div>

          {/* Product Info */}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold mb-2">
                  {service.category}
                </span>
                <InlineEditField ownerId={ownerId} listingType="soccerbook" listingId={service.id} field="name" value={service.name} tag="h1" className="text-2xl md:text-3xl font-extrabold text-primary leading-tight tracking-tight" />
                {service.tagline && (
                  <InlineEditField ownerId={ownerId} listingType="soccerbook" listingId={service.id} field="tagline" value={service.tagline} tag="p" className="text-sm text-accent font-medium mt-1" />
                )}
                <p className="text-sm text-muted mt-1">
                  by {service.author} &middot; {service.city}, {service.state}
                </p>
              </div>
              {service.price && (
                <div className="text-2xl font-bold text-primary">
                  {service.price}
                </div>
              )}
            </div>

            {service.description && (
              <div className="mb-6">
                <InlineEditField ownerId={ownerId} listingType="soccerbook" listingId={service.id} field="description" value={service.description} tag="p" className="text-gray-600 leading-relaxed whitespace-pre-line" multiline />
              </div>
            )}

            {/* Special Offers */}
            {(service.announcementHeading || service.announcementText || service.announcementImage || service.announcementHeading2 || service.announcementText2 || service.announcementImage2 || service.announcementHeading3 || service.announcementText3 || service.announcementImage3) && (
              <div className="space-y-4 mb-6">
                {(service.announcementHeading || service.announcementText || service.announcementImage) && (
                  <AnnouncementSection heading={service.announcementHeading || "Special Offer"} text={service.announcementText} image={service.announcementImage} ctaUrl={normalizeUrl(service.announcementCtaUrl || service.website)} ctaLabel={service.announcementCta || "Learn More →"} />
                )}
                {(service.announcementHeading2 || service.announcementText2 || service.announcementImage2) && (
                  <AnnouncementSection heading={service.announcementHeading2 || "Special Offer"} text={service.announcementText2} image={service.announcementImage2} ctaUrl={normalizeUrl(service.announcementCtaUrl2 || service.website)} ctaLabel={service.announcementCta2 || "Learn More →"} />
                )}
                {(service.announcementHeading3 || service.announcementText3 || service.announcementImage3) && (
                  <AnnouncementSection heading={service.announcementHeading3 || "Special Offer"} text={service.announcementText3} image={service.announcementImage3} ctaUrl={normalizeUrl(service.announcementCtaUrl3 || service.website)} ctaLabel={service.announcementCta3 || "Learn More →"} />
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap mb-6">
              {service.website && (
                <a
                  href={service.website.startsWith("http") ? service.website : `https://${service.website}`}
                  target="_blank"
                  rel="noopener"
                  className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors"
                >
                  Visit Website &rarr;
                </a>
              )}
              <a
                href={`/contact/service/${slug}`}
                className="bg-white text-primary border-2 border-border px-6 py-3 rounded-xl text-sm font-bold hover:bg-surface transition-colors"
              >
                Contact Provider
              </a>
            </div>

            {/* Details */}
            <div className="border-t border-border pt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted font-medium">Category</span>
                <p className="font-bold text-primary">{service.category}</p>
              </div>
              <div>
                <span className="text-muted font-medium">Provider</span>
                <p className="font-bold text-primary">{service.author}</p>
              </div>
              <div>
                <span className="text-muted font-medium">Location</span>
                <p className="font-bold text-primary">{service.city}, {service.state}</p>
              </div>
              {service.email && (
                <div>
                  <span className="text-muted font-medium">Email</span>
                  <p className="font-bold text-accent-hover"><a href={`/contact/service/${slug}`} className="hover:underline">Contact</a></p>
                </div>
              )}
              {service.phone && (
                <div>
                  <span className="text-muted font-medium">Phone</span>
                  <p className="font-bold text-primary">{service.phone}</p>
                </div>
              )}
            </div>

            {/* About the Author */}
            {service.aboutAuthor && (
              <div className="border-t border-border pt-6 mt-6">
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary leading-tight tracking-tight mb-3">About the Author</h2>
                <InlineEditField ownerId={ownerId} listingType="soccerbook" listingId={service.id} field="aboutAuthor" value={service.aboutAuthor} tag="p" className="text-gray-600 leading-relaxed whitespace-pre-line" multiline />
              </div>
            )}

            {/* Additional Photos */}
            {photos.length > 0 && (
              <div className="border-t border-border pt-6 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-bold text-primary">Photos</h3>
                  <EditSectionLink ownerId={ownerId} listingType="soccerbook" listingId={service.id} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <PhotoGrid photos={photos} alt="Service photo" />
                </div>
              </div>
            )}

            {/* Video */}
            {service.videoUrl && (
              <div className="border-t border-border pt-6 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-bold text-primary">Video</h3>
                  <EditSectionLink ownerId={ownerId} listingType="soccerbook" listingId={service.id} />
                </div>
                <VideoEmbed url={service.videoUrl} />
              </div>
            )}

            {/* Share */}
            <div className="border-t border-border pt-6 mt-6">
              <h4 className="text-sm font-bold mb-2.5">Share this listing</h4>
              <ShareButtons url={pageUrl} title={service.name} />
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="bg-white rounded-2xl p-6 shadow-sm"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" /><div className="h-20 bg-gray-200 rounded animate-pulse" /></div>}>
          <ReviewSection listingType="soccerbook" listingId={service.id} />
        </Suspense>

        {/* ====== Sponsors ====== */}
        {service.sponsors && service.sponsors.length > 0 && (
          <div className="order-8 lg:order-none lg:col-start-2">
            <SponsorsSection sponsors={service.sponsors} />
          </div>
        )}

        <div className="mt-8"><FeaturedArticles /></div>
        <ListingPostsSidebar listingType="soccerbook" listingId={service.id} slug={slug} ownerId={ownerId} />
        <div className="mt-8"><AnytimeInlineCTA /></div>
      </div>
    </>
  );
}
