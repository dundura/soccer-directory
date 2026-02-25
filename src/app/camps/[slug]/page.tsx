import { getCampBySlug, getCampSlugs, getListingOwner } from "@/lib/db";
import { Badge, AnytimeInlineCTA } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, PhotoGallery, SocialLinks, ShareButtons } from "@/components/profile-ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getCampSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const camp = await getCampBySlug(slug);
  if (!camp) return {};
  return {
    title: `${camp.name} | Soccer Camp in ${camp.city}, ${camp.state}`,
    description: camp.description,
  };
}

export default async function CampDetailPage({ params }: Props) {
  const { slug } = await params;
  const camp = await getCampBySlug(slug);
  if (!camp) notFound();
  const ownerId = await getListingOwner("camp", slug);

  const pageUrl = `https://www.soccer-near-me.com/camps/${slug}`;

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/camps" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; All Camps</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="orange">{camp.campType}</Badge>
            <Badge variant="default">{camp.gender}</Badge>
            <Badge variant="default">{camp.ageRange}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{camp.name}</h1>
              <p className="text-white/60 text-lg">{camp.organizerName} &middot; {camp.city}, {camp.state}</p>
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
              {camp.teamPhoto && (
                <img src={camp.teamPhoto} alt={camp.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                {camp.logo && (
                  <img src={camp.logo} alt={`${camp.name} logo`} className="w-16 h-16 rounded-xl object-contain border border-border mb-3 -mt-12 bg-white relative z-10" />
                )}
                <div className="space-y-3 mb-5">
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">When</p>
                    <p className="font-[family-name:var(--font-display)] font-bold text-lg">{camp.dates}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Price</p>
                    <p className="font-[family-name:var(--font-display)] font-bold text-2xl">{camp.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">Where</p>
                    <p className="font-medium">{camp.location || `${camp.city}, ${camp.state}`}</p>
                  </div>
                </div>
                {camp.registrationUrl ? (
                  <a href={camp.registrationUrl} target="_blank" className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors mb-3">
                    Visit &rarr;
                  </a>
                ) : (
                  <a href={`/contact/camp/${slug}`} className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors mb-3">
                    Contact Organizer
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Type</p><p className="font-medium">{camp.campType}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Ages</p><p className="font-medium">{camp.ageRange}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Gender</p><p className="font-medium">{camp.gender}</p></div>
              {camp.phone && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Phone</p><p className="font-medium">{camp.phone}</p></div>}
              {camp.email && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Email</p><a href={`mailto:${camp.email}`} className="font-medium text-accent-hover hover:underline">{camp.email}</a></div>}
            </div>

            <AnytimeInlineCTA />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About This Camp</h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">{camp.description}</p>
            </section>

            {camp.videoUrl && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Video</h2>
                <VideoEmbed url={camp.videoUrl} />
              </section>
            )}

            {camp.photos && camp.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Photos</h2>
                <PhotoGallery photos={camp.photos} />
              </section>
            )}

            <div className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-6">
              {camp.socialMedia && (
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Follow</h3>
                  <SocialLinks facebook={camp.socialMedia.facebook} instagram={camp.socialMedia.instagram} />
                </div>
              )}
              <div>
                <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Share</h3>
                <ShareButtons url={pageUrl} title={camp.name} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
