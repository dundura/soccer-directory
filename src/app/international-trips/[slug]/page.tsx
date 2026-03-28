import { Suspense } from "react";
import { getTripBySlug, getTripSlugs, getListingOwner } from "@/lib/db";
import { Badge, AnytimeInlineCTA } from "@/components/ui";
import { FeaturedArticles } from "@/components/featured-articles";
import { ListingPostsSidebar } from "@/components/listing-posts";
import { ReviewSection } from "@/components/review-section";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { TripInquiryForm } from "./inquiry-form";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SponsorsSection } from "@/components/sponsors-section";
import { ListingEventsSection } from "@/components/listing-events-section";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getTripSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${trip.tripName} — International Soccer Trip | ${trip.destination}`,
    trip.description || `${trip.level} international soccer trip for ${trip.ageGroup} ${trip.gender} to ${trip.destination}`,
    trip.imageUrl || trip.teamPhoto || trip.logo,
    `/international-trips/${slug}`,
  );
}

export default async function TripDetailPage({ params }: Props) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) notFound();
  const ownerId = await getListingOwner("trip", slug);

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/international-trips" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; All International Trips</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="blue">{trip.level}</Badge>
            <Badge variant={trip.gender === "Boys" ? "blue" : "purple"}>{trip.gender}</Badge>
            <Badge variant="default">{trip.ageGroup}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <InlineEditField ownerId={ownerId} listingType="trip" listingId={trip.id} field="tripName" value={trip.tripName} tag="h1" className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2" />
              {trip.tagline && (
                <InlineEditField ownerId={ownerId} listingType="trip" listingId={trip.id} field="tagline" value={trip.tagline} tag="p" className="text-white/80 text-sm font-medium" />
              )}
              <p className="text-white/60 text-lg">{trip.destination} &middot; {trip.organizer}</p>
            </div>
            <ManageListingButton ownerId={ownerId} listingType="trip" listingId={trip.id} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {trip.teamPhoto && (
                <img src={trip.teamPhoto} alt={trip.tripName} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                {trip.logo && (
                  <img src={trip.logo} alt={`${trip.tripName} logo`} className="w-16 h-16 rounded-xl object-contain border border-border mb-3 -mt-12 bg-white relative z-10" />
                )}
                <div className="space-y-3 mb-5">
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Destination</p>
                    <p className="font-[family-name:var(--font-display)] font-bold text-lg">{trip.destination}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">When</p>
                    <p className="font-medium">{trip.dates}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Organizer</p>
                    <p className="font-medium">{trip.organizer}</p>
                  </div>
                  {trip.price && (
                    <div>
                      <p className="text-xs text-muted font-medium uppercase tracking-wide">Price</p>
                      <p className="font-medium">{trip.price}</p>
                    </div>
                  )}
                  {trip.spotsAvailable && (
                    <div>
                      <p className="text-xs text-muted font-medium uppercase tracking-wide">Spots Available</p>
                      <p className="font-medium">{trip.spotsAvailable}</p>
                    </div>
                  )}
                </div>

                <a
                  href="#inquire"
                  className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
                >
                  Inquire Now
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Level</p><p className="font-medium">{trip.level}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Age Group</p><p className="font-medium">{trip.ageGroup}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Gender</p><p className="font-medium">{trip.gender}</p></div>
              {trip.phone && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Phone</p><p className="font-medium">{trip.phone}</p></div>}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {trip.description && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About This Trip</h2>
                <InlineEditField ownerId={ownerId} listingType="trip" listingId={trip.id} field="description" value={trip.description} tag="div" className="text-muted leading-relaxed whitespace-pre-line [&>p]:mb-2 [&>p:last-child]:mb-0" multiline />
              </section>
            )}

            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Trip Details</h2>
                <EditSectionLink ownerId={ownerId} listingType="trip" listingId={trip.id} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><p className="text-xs text-muted mb-1">Destination</p><p className="font-medium">{trip.destination}</p></div>
                <div><p className="text-xs text-muted mb-1">Dates</p><p className="font-medium">{trip.dates}</p></div>
                <div><p className="text-xs text-muted mb-1">Organizer</p><p className="font-medium">{trip.organizer}</p></div>
                <div><p className="text-xs text-muted mb-1">Level</p><p className="font-medium">{trip.level}</p></div>
                <div><p className="text-xs text-muted mb-1">Age Group</p><p className="font-medium">{trip.ageGroup}</p></div>
                <div><p className="text-xs text-muted mb-1">Gender</p><p className="font-medium">{trip.gender}</p></div>
                {trip.price && <div><p className="text-xs text-muted mb-1">Price</p><p className="font-medium">{trip.price}</p></div>}
                {trip.spotsAvailable && <div><p className="text-xs text-muted mb-1">Spots Available</p><p className="font-medium">{trip.spotsAvailable}</p></div>}
              </div>
            </section>

            {trip.videoUrl && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Video</h2>
                  <EditSectionLink ownerId={ownerId} listingType="trip" listingId={trip.id} />
                </div>
                <VideoEmbed url={trip.videoUrl} />
              </section>
            )}

            {trip.photos && trip.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Photos</h2>
                  <EditSectionLink ownerId={ownerId} listingType="trip" listingId={trip.id} />
                </div>
                <PhotoGallery photos={trip.photos} />
              </section>
            )}

            {/* Inquiry Form */}
            <section id="inquire" className="bg-white rounded-2xl border-2 border-accent/20 p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">Inquire About This Trip</h2>
              <p className="text-muted text-sm mb-6">Fill out the form below to express interest in this international trip. The organizer will review your inquiry and contact you directly.</p>
              <TripInquiryForm tripName={trip.tripName} destination={trip.destination} slug={slug} />
            </section>

            <Suspense fallback={<div className="bg-white rounded-2xl p-6 shadow-sm"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4" /><div className="h-20 bg-gray-200 rounded animate-pulse" /></div>}>
              <ReviewSection listingType="trip" listingId={trip.id} />
            </Suspense>

            {/* Events */}
            <ListingEventsSection listingType="trip" listingId={trip.id} listingSlug={slug} ownerId={ownerId} />

            <FeaturedArticles />

            <ListingPostsSidebar listingType="trip" listingId={trip.id} slug={slug} ownerId={ownerId} />

            {trip.socialMedia && (trip.socialMedia.facebook || trip.socialMedia.instagram) && (
              <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Follow</h3>
                <SocialLinks facebook={trip.socialMedia.facebook} instagram={trip.socialMedia.instagram} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Anytime Soccer Training Banner */}
      {/* ====== Sponsors ====== */}
      {trip.sponsors && trip.sponsors.length > 0 && (
        <div className="order-8 lg:order-none lg:col-start-2">
          <SponsorsSection sponsors={trip.sponsors} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnytimeInlineCTA />
      </div>
    </>
  );
}
