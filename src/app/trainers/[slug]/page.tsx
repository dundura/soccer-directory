import { getTrainerBySlug, getTrainerSlugs, getListingOwner } from "@/lib/db";
import { Badge } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { VideoEmbed, PhotoGallery, PracticeSchedule, SocialLinks, ShareButtons } from "@/components/profile-ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getTrainerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trainer = await getTrainerBySlug(slug);
  if (!trainer) return {};
  return {
    title: `${trainer.name} | Private Soccer Trainer in ${trainer.city}, ${trainer.state}`,
    description: trainer.description || `${trainer.specialty} trainer in ${trainer.serviceArea}`,
  };
}

export default async function TrainerDetailPage({ params }: Props) {
  const { slug } = await params;
  const trainer = await getTrainerBySlug(slug);
  if (!trainer) notFound();
  const ownerId = await getListingOwner("trainer", slug);

  const pageUrl = `https://www.soccer-near-me.com/trainers/${slug}`;

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/trainers" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; All Trainers</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="green">{trainer.specialty}</Badge>
            {trainer.rating > 0 && <Badge variant="default">&#9733; {trainer.rating} ({trainer.reviewCount} reviews)</Badge>}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{trainer.name}</h1>
              <p className="text-white/60 text-lg">{trainer.city}, {trainer.state}</p>
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
              {trainer.teamPhoto && (
                <img src={trainer.teamPhoto} alt={trainer.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                {trainer.logo && (
                  <img src={trainer.logo} alt={`${trainer.name} logo`} className="w-16 h-16 rounded-xl object-contain border border-border mb-3 -mt-12 bg-white relative z-10" />
                )}
                <h2 className="font-[family-name:var(--font-display)] font-bold text-lg">{trainer.name}</h2>
                <p className="text-muted text-sm mb-1">{trainer.specialty}</p>
                <p className="font-[family-name:var(--font-display)] text-xl font-bold text-accent mb-4">{trainer.priceRange}</p>

                <a
                  href={`/contact/trainer/${slug}`}
                  className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors mb-3"
                >
                  Contact Trainer
                </a>
                {trainer.website && (
                  <a
                    href={trainer.website.startsWith("http") ? trainer.website : `https://${trainer.website}`}
                    target="_blank"
                    className="block w-full text-center py-3 rounded-xl border-2 border-border text-primary font-semibold hover:bg-surface transition-colors"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Experience</p><p className="font-medium">{trainer.experience}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Credentials</p><p className="font-medium">{trainer.credentials}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Service Area</p><p className="font-medium">{trainer.serviceArea}</p></div>
              <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Pricing</p><p className="font-medium">{trainer.priceRange}</p></div>
              {trainer.address && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Location</p><p className="font-medium">{trainer.address}</p></div>}
              {trainer.phone && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Phone</p><p className="font-medium">{trainer.phone}</p></div>}
              {trainer.email && <div><p className="text-xs text-muted font-medium uppercase tracking-wide">Email</p><a href={`mailto:${trainer.email}`} className="font-medium text-accent-hover hover:underline">{trainer.email}</a></div>}
            </div>

          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {trainer.description && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About</h2>
                <p className="text-muted leading-relaxed whitespace-pre-line">{trainer.description}</p>
              </section>
            )}

            {trainer.practiceSchedule && trainer.practiceSchedule.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Availability</h2>
                <PracticeSchedule days={trainer.practiceSchedule} />
              </section>
            )}

            {trainer.videoUrl && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Video</h2>
                <VideoEmbed url={trainer.videoUrl} />
              </section>
            )}

            {trainer.photos && trainer.photos.length > 0 && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Photos</h2>
                <PhotoGallery photos={trainer.photos} />
              </section>
            )}

            <div className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-6">
              {trainer.socialMedia && (
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Connect</h3>
                  <SocialLinks website={trainer.website} facebook={trainer.socialMedia.facebook} instagram={trainer.socialMedia.instagram} />
                </div>
              )}
              <div>
                <h3 className="font-[family-name:var(--font-display)] font-bold mb-3">Share</h3>
                <ShareButtons url={pageUrl} title={trainer.name} />
              </div>
            </div>
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
