import { getMarketplaceItemBySlug, getEbookSlugs, getListingOwner } from "@/lib/db";
import { Badge } from "@/components/ui";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { PhotoGallery } from "@/components/profile-ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getEbookSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getMarketplaceItemBySlug(slug);
  if (!item) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${item.name} — Ebook | Soccer Near Me`,
    item.description?.slice(0, 160) || `Free soccer ebook — ${item.city}, ${item.state}`,
    item.imageUrl,
    `/ebooks/${slug}`,
  );
}

const DEFAULT_IMAGE = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

export default async function EbookDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getMarketplaceItemBySlug(slug);
  if (!item) notFound();
  const ownerId = await getListingOwner("ebook", slug);

  const mainImage = item.imageUrl || DEFAULT_IMAGE;

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/ebooks" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; Back to Ebooks</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="green">Ebook</Badge>
            {item.condition && <Badge variant="default">{item.condition}</Badge>}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <InlineEditField ownerId={ownerId} listingType="ebook" listingId={item.id} field="name" value={item.name} tag="h1" className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2" />
              {item.tagline && (
                <InlineEditField ownerId={ownerId} listingType="ebook" listingId={item.id} field="tagline" value={item.tagline} tag="p" className="text-white/80 text-sm font-medium" />
              )}
              <p className="text-white/60 text-lg">{item.city}, {item.state}</p>
            </div>
            <ManageListingButton ownerId={ownerId} listingType="ebook" listingId={item.id} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-[280px] shrink-0 space-y-6">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <img src={mainImage} alt={item.name} className="w-full h-48 object-cover" />
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wide">Price</p>
                  <p className="font-[family-name:var(--font-display)] font-bold text-2xl text-accent">{item.price}</p>
                </div>
                {item.condition && (
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Format</p>
                    <p className="font-medium">{item.condition}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wide">Location</p>
                  <p className="font-medium">{item.city}, {item.state}{item.country && item.country !== "United States" ? `, ${item.country}` : ""}</p>
                </div>
                <hr className="border-border" />
                <a
                  href={`/contact/ebook/${slug}`}
                  className="block w-full py-3 rounded-xl bg-accent text-white text-center font-semibold hover:bg-accent-hover transition-colors"
                >
                  Get This Ebook
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-border p-6 md:p-8 mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Description</h2>
              <InlineEditField ownerId={ownerId} listingType="ebook" listingId={item.id} field="description" value={item.description} tag="p" className="prose prose-sm max-w-none text-muted leading-relaxed whitespace-pre-wrap" multiline />
            </div>

            {item.aboutAuthor && (
              <div className="bg-white rounded-2xl border border-border p-6 md:p-8 mb-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About the Author</h2>
                <InlineEditField ownerId={ownerId} listingType="ebook" listingId={item.id} field="aboutAuthor" value={item.aboutAuthor} tag="p" className="prose prose-sm max-w-none text-muted leading-relaxed whitespace-pre-wrap" multiline />
              </div>
            )}

            {item.photos && item.photos.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Photos</h2>
                  <EditSectionLink ownerId={ownerId} listingType="ebook" listingId={item.id} />
                </div>
                <PhotoGallery photos={item.photos} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
