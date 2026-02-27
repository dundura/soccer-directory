import { getServiceBySlug, getServiceSlugs, getListingOwner } from "@/lib/db";
import { ManageListingButton } from "@/components/manage-listing-button";
import { ShareButtons } from "@/components/profile-ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const DEFAULT_IMAGE = "http://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${service.name} | Products & Services | Soccer Near Me`,
    service.description || `${service.category} by ${service.providerName}`,
    service.imageUrl,
    `/services/${slug}`,
  );
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  let service;
  try {
    service = await getServiceBySlug(slug);
  } catch {
    throw new Error("Failed to load service details. Please try again later.");
  }
  if (!service) notFound();

  let ownerId: string | null = null;
  try {
    ownerId = await getListingOwner("service", slug);
  } catch {
    ownerId = null;
  }

  const pageUrl = `https://www.soccer-near-me.com/services/${slug}`;
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
          <a href="/services" className="text-primary hover:underline">Products &amp; Services</a>
          {" \u203A "}
          <span>{service.category}</span>
          {" \u203A "}
          <span>{service.name}</span>
        </div>
        <ManageListingButton ownerId={ownerId} listingType="service" listingId={service.id} />
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
                <h1 className="text-2xl md:text-3xl font-extrabold text-primary leading-tight tracking-tight">
                  {service.name}
                </h1>
                <p className="text-sm text-muted mt-1">
                  by {service.providerName} &middot; {service.city}, {service.state}
                </p>
              </div>
              {service.price && (
                <div className="text-2xl font-bold text-primary">
                  {service.price}
                </div>
              )}
            </div>

            {service.description && (
              <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-6">
                {service.description}
              </p>
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
                <p className="font-bold text-primary">{service.providerName}</p>
              </div>
              <div>
                <span className="text-muted font-medium">Location</span>
                <p className="font-bold text-primary">{service.city}, {service.state}</p>
              </div>
              {service.email && (
                <div>
                  <span className="text-muted font-medium">Email</span>
                  <p className="font-bold text-accent-hover">
                    <a href={`mailto:${service.email}`} className="hover:underline">{service.email}</a>
                  </p>
                </div>
              )}
              {service.phone && (
                <div>
                  <span className="text-muted font-medium">Phone</span>
                  <p className="font-bold text-primary">{service.phone}</p>
                </div>
              )}
            </div>

            {/* Additional Photos */}
            {photos.length > 0 && (
              <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-[15px] font-bold text-primary mb-3">Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((photo, i) => (
                    <img key={i} src={photo} alt={`${service.name} photo ${i + 1}`} className="w-full aspect-square object-contain rounded-xl bg-surface" />
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="border-t border-border pt-6 mt-6">
              <h4 className="text-sm font-bold mb-2.5">Share this listing</h4>
              <ShareButtons url={pageUrl} title={service.name} />
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-primary rounded-2xl px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
          <div>
            <h2 className="text-[22px] font-extrabold text-white tracking-tight mb-1.5">
              Supplement Team Training with 5,000+ Videos
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Structured follow-along sessions your player can do at home, in the backyard, or at the park.
            </p>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <img src="/ast-shield.png" alt="Anytime Soccer Training" className="h-20 opacity-90 hidden md:block" />
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
    </>
  );
}
