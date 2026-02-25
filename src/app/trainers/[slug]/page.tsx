import { getTrainerBySlug, getTrainerSlugs } from "@/lib/db";
import { Badge, AnytimeInlineCTA } from "@/components/ui";
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

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/trainers" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">← All Trainers</a>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="green">{trainer.specialty}</Badge>
            <Badge variant="default">⭐ {trainer.rating} ({trainer.reviewCount} reviews)</Badge>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">{trainer.name}</h1>
          <p className="text-white/60 text-lg">{trainer.city}, {trainer.state}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {trainer.description && (
              <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">About</h2>
                <p className="text-muted leading-relaxed">{trainer.description}</p>
              </section>
            )}
            <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><p className="text-xs text-muted mb-1">Specialty</p><p className="font-medium">{trainer.specialty}</p></div>
                <div><p className="text-xs text-muted mb-1">Experience</p><p className="font-medium">{trainer.experience}</p></div>
                <div><p className="text-xs text-muted mb-1">Credentials</p><p className="font-medium">{trainer.credentials}</p></div>
                <div><p className="text-xs text-muted mb-1">Pricing</p><p className="font-medium">{trainer.priceRange}</p></div>
                <div className="sm:col-span-2"><p className="text-xs text-muted mb-1">Service Area</p><p className="font-medium">{trainer.serviceArea}</p></div>
              </div>
            </section>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-[family-name:var(--font-display)] font-bold mb-1">{trainer.priceRange}</h3>
              <p className="text-muted text-sm mb-4">per session</p>
              <a href="#" className="block w-full text-center py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors mb-3">
                Contact Trainer
              </a>
            </div>
            <AnytimeInlineCTA />
          </div>
        </div>
      </div>
    </>
  );
}
