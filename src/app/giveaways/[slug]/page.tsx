import { Suspense } from "react";
import { getMarketplaceItemBySlug, getGiveawaySlugs, getListingOwner } from "@/lib/db";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { ShareButtons } from "@/components/profile-ui";
import { PhotoGrid } from "@/components/photo-grid";
import { FeaturedArticles } from "@/components/featured-articles";
import { ListingPostsSidebar } from "@/components/listing-posts";
import { ReviewSection } from "@/components/review-section";
import { AnnouncementSection } from "@/components/announcement-section";
import { AnytimeInlineCTA } from "@/components/ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SponsorsSection } from "@/components/sponsors-section";
import { ListingEventsSection } from "@/components/listing-events-section";

export const dynamic = "force-dynamic";

const DEFAULT_IMAGE = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getGiveawaySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getMarketplaceItemBySlug(slug);
  if (!item) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${item.name} — Free Giveaway | Soccer Near Me`,
    item.description?.slice(0, 160) || `Free soccer giveaway — ${item.city}, ${item.state}`,
    item.imageUrl,
    `/giveaways/${slug}`,
  );
}

export default async function GiveawayDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getMarketplaceItemBySlug(slug);
  if (!item) notFound();

  let ownerId: string | null = null;
  try {
    ownerId = await getListingOwner("giveaway", slug);
  } catch {
    ownerId = null;
  }

  const pageUrl = `https://www.soccer-near-me.com/giveaways/${slug}`;
  const image = item.imageUrl || DEFAULT_IMAGE;
  const photos = item.photos && item.photos.length > 0 ? item.photos : [];

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 py-3.5 text-sm text-muted flex items-center justify-between">
        <div>
          <a href="/giveaways" className="text-primary hover:underline">Giveaways</a>
          {" \u203A "}
          <span>{item.condition || "Giveaway"}</span>
          {" \u203A "}
          <span>{item.name}</span>
        </div>
        <ManageListingButton ownerId={ownerId} listingType="giveaway" listingId={item.id} />
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Product Image */}
          <div className="bg-surface flex items-center justify-center p-8">
            <img
              src={image}
              alt={item.name}
              className="max-h-[400px] w-auto object-contain rounded-xl"
            />
          </div>

          {/* Product Info */}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold mb-2">
                  {item.condition || "Giveaway"}
                </span>
                <InlineEditField ownerId={ownerId} listingType="giveaway" listingId={item.id} field="name" value={item.name} tag="h1" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase leading-tight tracking-tight" />
                {item.tagline && (
                  <InlineEditField ownerId={ownerId} listingType="giveaway" listingId={item.id} field="tagline" value={item.tagline} tag="p" className="text-sm text-accent font-medium mt-1" />
                )}
                <p className="text-sm text-muted mt-1">
                  {item.city}, {item.state}{item.country && item.country !== "United States" ? `, ${item.country}` : ""}
                </p>
              </div>
              {item.price && (
                <div className="text-2xl font-bold text-primary">
                  {item.price}
                </div>
              )}
            </div>

            {item.description && (
              <div className="mb-6">
                <InlineEditField ownerId={ownerId} listingType="giveaway" listingId={item.id} field="description" value={item.description} tag="p" className="text-gray-600 leading-relaxed whitespace-pre-line" multiline />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap mb-6">
              <a
                href={`/contact/giveaway/${slug}`}
                className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors"
              >
                Claim This Giveaway &rarr;
              </a>
            </div>

            {/* Free Giveaway Announcement */}
            <div className="space-y-4 mb-6">
              <AnnouncementSection
                heading="Free Giveaway"
                text={`${item.name} — valued at ${item.price || "Free"}. Claim yours today!`}
                image={image}
                ctaUrl={`/contact/giveaway/${slug}`}
                ctaLabel="Claim Now →"
              />
            </div>

            {/* Details */}
            <div className="border-t border-border pt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted font-medium">Type</span>
                <p className="font-bold text-primary">{item.condition || "Giveaway"}</p>
              </div>
              <div>
                <span className="text-muted font-medium">Value</span>
                <p className="font-bold text-primary">{item.price}</p>
              </div>
              <div>
                <span className="text-muted font-medium">Location</span>
                <p className="font-bold text-primary">{item.city}, {item.state}</p>
              </div>
            </div>

            {/* About the Provider */}
            {item.aboutAuthor && (
              <div className="border-t border-border pt-6 mt-6">
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary leading-tight tracking-tight mb-3">About the Provider</h2>
                <InlineEditField ownerId={ownerId} listingType="giveaway" listingId={item.id} field="aboutAuthor" value={item.aboutAuthor} tag="p" className="text-gray-600 leading-relaxed whitespace-pre-line" multiline />
              </div>
            )}

            {/* Additional Photos */}
            {photos.length > 0 && (
              <div className="border-t border-border pt-6 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight">Photos</h3>
                  <EditSectionLink ownerId={ownerId} listingType="giveaway" listingId={item.id} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <PhotoGrid photos={photos} alt="Giveaway photo" />
                </div>
              </div>
            )}

            <Suspense fallback={<div className="bg-white rounded-2xl p-6 shadow-sm"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" /><div className="h-20 bg-gray-200 rounded animate-pulse" /></div>}>
              <ReviewSection listingType="giveaway" listingId={item.id} />
            </Suspense>

            {/* Events */}
            <ListingEventsSection listingType="giveaway" listingId={item.id} listingSlug={slug} ownerId={ownerId} />

            <FeaturedArticles />

            <ListingPostsSidebar listingType="giveaway" listingId={item.id} slug={slug} ownerId={ownerId} />

            {/* Share */}
            <div className="border-t border-border pt-6 mt-6">
              <h4 className="text-sm font-bold mb-2.5">Share this listing</h4>
              <ShareButtons url={pageUrl} title={item.name} />
            </div>
          </div>
        </div>

        {/* Sponsors */}
        {item.sponsors && item.sponsors.length > 0 && (
          <SponsorsSection sponsors={item.sponsors} />
        )}

        <div className="mt-8"><AnytimeInlineCTA /></div>
      </div>
    </>
  );
}
