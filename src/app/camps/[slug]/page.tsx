import { getCampBySlug, getCampSlugs, getListingOwner } from "@/lib/db";
import { Badge, AnytimeInlineCTA } from "@/components/ui";
import { ManageListingButton } from "@/components/manage-listing-button";
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

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/camps" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">← All Camps</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="orange">{camp.campType}</Badge>
            <Badge variant="default">{camp.gender}</Badge>
            <Badge variant="default">{camp.ageRange}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{camp.name}</h1>
              <p className="text-white/60 text-lg">{camp.organizerName} · {camp.city}, {camp.state}</p>
            </div>
            <ManageListingButton ownerId={ownerId} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About This Camp</h2>
              <p className="text-muted leading-relaxed">{camp.description}</p>
            </section>
            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Camp Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><p className="text-xs text-muted mb-1">Type</p><p className="font-medium">{camp.campType}</p></div>
                <div><p className="text-xs text-muted mb-1">Ages</p><p className="font-medium">{camp.ageRange}</p></div>
                <div><p className="text-xs text-muted mb-1">Dates</p><p className="font-medium">{camp.dates}</p></div>
                <div><p className="text-xs text-muted mb-1">Price</p><p className="font-medium">{camp.price}</p></div>
                <div><p className="text-xs text-muted mb-1">Gender</p><p className="font-medium">{camp.gender}</p></div>
                <div><p className="text-xs text-muted mb-1">Location</p><p className="font-medium">{camp.city}, {camp.state}</p></div>
              </div>
            </section>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6">
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
                  <p className="font-medium">{camp.city}, {camp.state}</p>
                </div>
              </div>
              {camp.registrationUrl ? (
                <a href={camp.registrationUrl} target="_blank" className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors mb-3">
                  Visit →
                </a>
              ) : (
                <a href="#" className="block w-full text-center py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors mb-3">
                  Contact Organizer
                </a>
              )}
            </div>
            <AnytimeInlineCTA />
          </div>
        </div>
      </div>
    </>
  );
}
