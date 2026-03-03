import { getTrainingAppBySlug, getTrainingAppSlugs, getListingOwner } from "@/lib/db";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { VideoEmbed, ShareButtons } from "@/components/profile-ui";
import { AnnouncementSection } from "@/components/announcement-section";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const DEFAULT_IMAGE = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getTrainingAppSlugs();
  return slugs.map((slug) => ({ slug }));
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
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-primary leading-tight tracking-tight">
                    {app.name}
                  </h1>
                  <EditSectionLink ownerId={ownerId} listingType="trainingapp" listingId={app.id} />
                </div>
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
              <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-6">
                {app.description}
              </p>
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
            {(app.announcementText || app.announcementText2 || app.announcementText3) && (
              <div className="space-y-4 mb-6">
                {app.announcementText && (
                  <AnnouncementSection heading={app.announcementHeading || "Special Offer"} text={app.announcementText} image={app.announcementImage} ctaUrl={app.website ? (app.website.startsWith("http") ? app.website : `https://${app.website}`) : undefined} ctaLabel={app.announcementCta || "Learn More →"} />
                )}
                {app.announcementText2 && (
                  <AnnouncementSection heading={app.announcementHeading2 || "Special Offer"} text={app.announcementText2} image={app.announcementImage2} ctaUrl={app.website ? (app.website.startsWith("http") ? app.website : `https://${app.website}`) : undefined} ctaLabel={app.announcementCta2 || "Learn More →"} />
                )}
                {app.announcementText3 && (
                  <AnnouncementSection heading={app.announcementHeading3 || "Special Offer"} text={app.announcementText3} image={app.announcementImage3} ctaUrl={app.website ? (app.website.startsWith("http") ? app.website : `https://${app.website}`) : undefined} ctaLabel={app.announcementCta3 || "Learn More →"} />
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
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-primary leading-tight tracking-tight">About the Author</h2>
                  <EditSectionLink ownerId={ownerId} listingType="trainingapp" listingId={app.id} />
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{app.aboutAuthor}</p>
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
                  {photos.map((photo, i) => (
                    <img key={i} src={photo} alt={`${app.name} photo ${i + 1}`} className="w-full aspect-square object-contain rounded-xl bg-surface" />
                  ))}
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

            {/* Share */}
            <div className="border-t border-border pt-6 mt-6">
              <h4 className="text-sm font-bold mb-2.5">Share this listing</h4>
              <ShareButtons url={pageUrl} title={app.name} />
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
