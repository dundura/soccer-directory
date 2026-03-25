import { Suspense } from "react";
import { getTrainingAppBySlug, getTrainingAppSlugs, getListingOwner } from "@/lib/db";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { VideoEmbed, ShareButtons } from "@/components/profile-ui";
import { FeaturedArticles } from "@/components/featured-articles";
import { PhotoGrid } from "@/components/photo-grid";
import { ListingPostsSidebar } from "@/components/listing-posts";
import { ReviewSection } from "@/components/review-section";
import { AnytimeInlineCTA } from "@/components/ui";
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
    const slugs = await getTrainingAppSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = await getTrainingAppBySlug(slug);
  if (!app) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${app.name} | Training Apps | Soccer Near Me`,
    app.description || `${app.category} by ${app.providerName}`,
    app.imageUrl,
    `/training-apps/${slug}`,
  );
}

export default async function TrainingAppDetailPage({ params }: Props) {
  const { slug } = await params;

  let app;
  try {
    app = await getTrainingAppBySlug(slug);
  } catch {
    throw new Error("Failed to load training app details. Please try again later.");
  }
  if (!app) notFound();

  let ownerId: string | null = null;
  try {
    ownerId = await getListingOwner("trainingapp", slug);
  } catch {
    ownerId = null;
  }

  const pageUrl = `https://www.soccer-near-me.com/training-apps/${slug}`;
  const image = app.imageUrl || DEFAULT_IMAGE;
  let photos: string[] = [];
  if (app.photos && app.photos.length > 0) {
    photos = app.photos;
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 py-3.5 text-sm text-muted flex items-center justify-between">
        <div>
          <a href="/training-apps" className="text-primary hover:underline">Training Apps</a>
          {" \u203A "}
          <span>{app.category}</span>
          {" \u203A "}
          <span>{app.name}</span>
        </div>
        <ManageListingButton ownerId={ownerId} listingType="trainingapp" listingId={app.id} />
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Product Image */}
          <div className="bg-surface flex items-center justify-center p-8">
            <img
              src={image}
              alt={app.name}
              className="max-h-[400px] w-auto object-contain rounded-xl"
            />
          </div>

          {/* Product Info */}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold mb-2">
                  {app.category}
                </span>
                <InlineEditField ownerId={ownerId} listingType="trainingapp" listingId={app.id} field="name" value={app.name} tag="h1" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase leading-tight tracking-tight" />
                {app.tagline && (
                  <InlineEditField ownerId={ownerId} listingType="trainingapp" listingId={app.id} field="tagline" value={app.tagline} tag="p" className="text-sm text-accent font-medium mt-1" />
                )}
                <p className="text-sm text-muted mt-1">
                  by {app.providerName} &middot; {app.city}, {app.state}
                </p>
              </div>
              {app.price && (
                <div className="text-2xl font-bold text-primary">
                  {app.price}
                </div>
              )}
            </div>

            {app.description && (
              <div className="mb-6">
                <InlineEditField ownerId={ownerId} listingType="trainingapp" listingId={app.id} field="description" value={app.description} tag="p" className="text-gray-600 leading-relaxed whitespace-pre-line" multiline />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap mb-6">
              {app.website && (
                <a
                  href={app.website.startsWith("http") ? app.website : `https://${app.website}`}
                  target="_blank"
                  rel="noopener"
                  className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors"
                >
                  Visit Website &rarr;
                </a>
              )}
              <a
                href={`/contact/trainingapp/${slug}`}
                className="bg-white text-primary border-2 border-border px-6 py-3 rounded-xl text-sm font-bold hover:bg-surface transition-colors"
              >
                Contact Provider
              </a>
            </div>

            {/* Special Offers */}
            {(app.announcementHeading || app.announcementText || app.announcementImage || app.announcementHeading2 || app.announcementText2 || app.announcementImage2 || app.announcementHeading3 || app.announcementText3 || app.announcementImage3) && (
              <div className="space-y-4 mb-6">
                {(app.announcementHeading || app.announcementText || app.announcementImage) && (
                  <AnnouncementSection heading={app.announcementHeading || "Special Offer"} text={app.announcementText} image={app.announcementImage} ctaUrl={normalizeUrl(app.announcementCtaUrl || app.website)} ctaLabel={app.announcementCta || "Learn More →"} />
                )}
                {(app.announcementHeading2 || app.announcementText2 || app.announcementImage2) && (
                  <AnnouncementSection heading={app.announcementHeading2 || "Special Offer"} text={app.announcementText2} image={app.announcementImage2} ctaUrl={normalizeUrl(app.announcementCtaUrl2 || app.website)} ctaLabel={app.announcementCta2 || "Learn More →"} />
                )}
                {(app.announcementHeading3 || app.announcementText3 || app.announcementImage3) && (
                  <AnnouncementSection heading={app.announcementHeading3 || "Special Offer"} text={app.announcementText3} image={app.announcementImage3} ctaUrl={normalizeUrl(app.announcementCtaUrl3 || app.website)} ctaLabel={app.announcementCta3 || "Learn More →"} />
                )}
              </div>
            )}

            {/* Details */}
            <div className="border-t border-border pt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted font-medium">Category</span>
                <p className="font-bold text-primary">{app.category}</p>
              </div>
              <div>
                <span className="text-muted font-medium">Provider</span>
                <p className="font-bold text-primary">{app.providerName}</p>
              </div>
              <div>
                <span className="text-muted font-medium">Location</span>
                <p className="font-bold text-primary">{app.city}, {app.state}</p>
              </div>
              {app.email && (
                <div>
                  <span className="text-muted font-medium">Email</span>
                  <p className="font-bold text-accent-hover"><a href={`/contact/trainingapp/${slug}`} className="hover:underline">Contact</a></p>
                </div>
              )}
              {app.phone && (
                <div>
                  <span className="text-muted font-medium">Phone</span>
                  <p className="font-bold text-primary">{app.phone}</p>
                </div>
              )}
            </div>

            {/* About the Author */}
            {app.aboutAuthor && (
              <div className="border-t border-border pt-6 mt-6">
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary leading-tight tracking-tight mb-3">About the Author</h2>
                <InlineEditField ownerId={ownerId} listingType="trainingapp" listingId={app.id} field="aboutAuthor" value={app.aboutAuthor} tag="p" className="text-gray-600 leading-relaxed whitespace-pre-line" multiline />
              </div>
            )}

            {/* Additional Photos */}
            {photos.length > 0 && (
              <div className="border-t border-border pt-6 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-bold text-primary">Photos</h3>
                  <EditSectionLink ownerId={ownerId} listingType="trainingapp" listingId={app.id} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <PhotoGrid photos={photos} alt="App photo" />
                </div>
              </div>
            )}

            {/* Video */}
            {app.videoUrl && (
              <div className="border-t border-border pt-6 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-bold text-primary">Video</h3>
                  <EditSectionLink ownerId={ownerId} listingType="trainingapp" listingId={app.id} />
                </div>
                <VideoEmbed url={app.videoUrl} />
              </div>
            )}

            <Suspense fallback={<div className="bg-white rounded-2xl p-6 shadow-sm"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" /><div className="h-20 bg-gray-200 rounded animate-pulse" /></div>}>
              <ReviewSection listingType="trainingapp" listingId={app.id} />
            </Suspense>

            <FeaturedArticles />

            <ListingPostsSidebar listingType="trainingapp" listingId={app.id} slug={slug} ownerId={ownerId} />

            {/* Share */}
            <div className="border-t border-border pt-6 mt-6">
              <h4 className="text-sm font-bold mb-2.5">Share this listing</h4>
              <ShareButtons url={pageUrl} title={app.name} />
            </div>
          </div>
        </div>

        {/* ====== Sponsors ====== */}
        {app.sponsors && app.sponsors.length > 0 && (
          <div className="order-8 lg:order-none lg:col-start-2">
            <SponsorsSection sponsors={app.sponsors} />
          </div>
        )}

        <div className="mt-8"><AnytimeInlineCTA /></div>
      </div>
    </>
  );
}
