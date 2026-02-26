import { getMarketplaceItemBySlug, getListingOwner } from "@/lib/db";
import { Badge } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { PhotoGallery } from "@/components/profile-ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getMarketplaceItemBySlug(slug);
  if (!item) return {};
  return {
    title: `${item.name} — ${item.category} | Soccer Near Me`,
    description: item.description?.slice(0, 160) || `${item.category} for sale — ${item.price} in ${item.city}, ${item.state}`,
  };
}

const DEFAULT_IMAGE = "https://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

export default async function ShopDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getMarketplaceItemBySlug(slug);
  if (!item) notFound();
  const ownerId = await getListingOwner("marketplace", slug);

  const mainImage = item.imageUrl || DEFAULT_IMAGE;

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/shop" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; Back to Shop</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="green">{item.category}</Badge>
            <Badge variant="default">{item.condition}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{item.name}</h1>
              <p className="text-white/60 text-lg">{item.city}, {item.state}</p>
            </div>
            <ManageListingButton ownerId={ownerId} listingType="marketplace" listingId={item.id} />
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
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wide">Condition</p>
                  <p className="font-medium">{item.condition}</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wide">Category</p>
                  <p className="font-medium">{item.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wide">Location</p>
                  <p className="font-medium">{item.city}, {item.state}{item.country && item.country !== "United States" ? `, ${item.country}` : ""}</p>
                </div>
                <hr className="border-border" />
                <a
                  href={`/contact/marketplace/${slug}`}
                  className="block w-full py-3 rounded-xl bg-accent text-white text-center font-semibold hover:bg-accent-hover transition-colors"
                >
                  Contact Seller
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-border p-6 md:p-8 mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Description</h2>
              <div className="prose prose-sm max-w-none text-muted leading-relaxed whitespace-pre-wrap">
                {item.description}
              </div>
            </div>

            {/* Photos */}
            {item.photos && item.photos.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Photos</h2>
                <PhotoGallery photos={item.photos} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
