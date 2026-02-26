import { getGuestBySlug, getGuestSlugs, getListingOwner } from "@/lib/db";
import { Badge } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { RequestSpotForm } from "./request-spot-form";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getGuestSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const opp = await getGuestBySlug(slug);
  if (!opp) return {};
  return {
    title: `${opp.teamName} — Guest Player Opportunity | ${opp.tournament}`,
    description: opp.description || `${opp.level} guest player opportunity for ${opp.ageGroup} ${opp.gender} at ${opp.tournament} in ${opp.city}, ${opp.state}`,
  };
}

export default async function GuestDetailPage({ params }: Props) {
  const { slug } = await params;
  const opp = await getGuestBySlug(slug);
  if (!opp) notFound();
  const ownerId = await getListingOwner("guest", slug);


  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/guest-play" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; All Guest Opportunities</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="blue">{opp.level}</Badge>
            <Badge variant={opp.gender === "Boys" ? "blue" : "purple"}>{opp.gender}</Badge>
            <Badge variant="default">{opp.ageGroup}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{opp.teamName}</h1>
              <p className="text-white/60 text-lg">{opp.tournament} &middot; {opp.city}, {opp.state}</p>
            </div>
            <ManageListingButton ownerId={ownerId} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {opp.teamPhoto && (
                <img src={opp.teamPhoto} alt={opp.teamName} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                {opp.logo && (
                  <img src={opp.logo} alt={`${opp.teamName} logo`} className="w-16 h-16 rounded-xl object-contain border border-border mb-3 -mt-12 bg-white relative z-10" />
                )}
                <div className="space-y-3 mb-5">
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Tournament</p>
                    <p className="font-[family-name:var(--font-display)] font-bold text-lg">{opp.tournament}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">When</p>
                    <p className="font-medium">{opp.dates}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Where</p>
                    <p className="font-medium">{opp.city}, {opp.state}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Positions Needed</p>
                    <p className="font-medium">{opp.positionsNeeded}</p>
                  </div>
                </div>

                <a
                  href="#request-spot"
                  className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
                >
                  Request Spot
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Level</p><p className="font-medium">{opp.level}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Age Group</p><p className="font-medium">{opp.ageGroup}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Gender</p><p className="font-medium">{opp.gender}</p></div>
              {opp.phone && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Phone</p><p className="font-medium">{opp.phone}</p></div>}
            </div>

          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {opp.description && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About This Opportunity</h2>
                <p className="text-muted leading-relaxed whitespace-pre-line">{opp.description}</p>
              </section>
            )}

            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Opportunity Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><p className="text-xs text-muted mb-1">Tournament</p><p className="font-medium">{opp.tournament}</p></div>
                <div><p className="text-xs text-muted mb-1">Dates</p><p className="font-medium">{opp.dates}</p></div>
                <div><p className="text-xs text-muted mb-1">Location</p><p className="font-medium">{opp.city}, {opp.state}</p></div>
                <div><p className="text-xs text-muted mb-1">Level</p><p className="font-medium">{opp.level}</p></div>
                <div><p className="text-xs text-muted mb-1">Age Group</p><p className="font-medium">{opp.ageGroup}</p></div>
                <div><p className="text-xs text-muted mb-1">Gender</p><p className="font-medium">{opp.gender}</p></div>
                <div className="sm:col-span-2"><p className="text-xs text-muted mb-1">Positions Needed</p><p className="font-medium">{opp.positionsNeeded}</p></div>
              </div>
            </section>

            {opp.videoUrl && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Video</h2>
                <VideoEmbed url={opp.videoUrl} />
              </section>
            )}

            {opp.photos && opp.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Photos</h2>
                <PhotoGallery photos={opp.photos} />
              </section>
            )}

            {/* Request Spot Form */}
            <section id="request-spot" className="bg-white rounded-2xl border-2 border-accent/20 p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">Request a Spot</h2>
              <p className="text-muted text-sm mb-6">Fill out the form below to express interest in this guest player opportunity. The team will review your request and contact you directly.</p>
              <RequestSpotForm teamName={opp.teamName} tournament={opp.tournament} slug={slug} />
            </section>

            {opp.socialMedia && (opp.socialMedia.facebook || opp.socialMedia.instagram) && (
              <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Follow</h3>
                <SocialLinks facebook={opp.socialMedia.facebook} instagram={opp.socialMedia.instagram} />
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
