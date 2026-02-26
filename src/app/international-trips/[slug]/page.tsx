import { getTripBySlug, getTripSlugs, getListingOwner } from "@/lib/db";
import { Badge } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { TripInquiryForm } from "./inquiry-form";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getTripSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) return {};
  return {
    title: `${trip.tripName} — International Soccer Trip | ${trip.destination}`,
    description: trip.description || `${trip.level} international soccer trip for ${trip.ageGroup} ${trip.gender} to ${trip.destination}`,
  };
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
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{trip.tripName}</h1>
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
                <p className="text-muted leading-relaxed whitespace-pre-line">{trip.description}</p>
              </section>
            )}

            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Trip Details</h2>
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
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Video</h2>
                <VideoEmbed url={trip.videoUrl} />
              </section>
            )}

            {trip.photos && trip.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Photos</h2>
                <PhotoGallery photos={trip.photos} />
              </section>
            )}

            {/* Inquiry Form */}
            <section id="inquire" className="bg-white rounded-2xl border-2 border-accent/20 p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">Inquire About This Trip</h2>
              <p className="text-muted text-sm mb-6">Fill out the form below to express interest in this international trip. The organizer will review your inquiry and contact you directly.</p>
              <TripInquiryForm tripName={trip.tripName} destination={trip.destination} slug={slug} />
            </section>

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
      <div className="bg-[#0F3154] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-3">
              Supplement Team Training with 5,000+ Follow-Along Videos
            </h2>
            <p className="text-white/70 text-lg mb-6">
              Structured sessions your player can do at home, in the backyard, or at the park.
            </p>
            <a
              href="https://anytime-soccer.com"
              target="_blank"
              className="inline-block px-8 py-4 rounded-xl bg-[#DC373E] text-white font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Try It Free &rarr;
            </a>
          </div>
          <img
            src="/ast-shield.png"
            alt="Anytime Soccer Training"
            className="hidden md:block w-48 h-48 object-contain"
          />
        </div>
      </div>
    </>
  );
}
