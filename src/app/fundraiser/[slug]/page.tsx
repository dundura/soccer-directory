import { getFundraiserBySlug, getDonationsByFundraiserId } from "@/lib/db";
import { ShareButtons } from "@/components/profile-ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFundraiserBySlug(slug);
  if (!f) return {};
  return {
    title: `${f.title} — Fundraiser | Soccer Near Me`,
    description: f.description?.slice(0, 160) || `Support ${f.title} with a donation`,
    openGraph: { images: f.heroImageUrl ? [f.heroImageUrl] : [] },
  };
}

const DEFAULT_HERO = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

export default async function FundraiserPage({ params }: Props) {
  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);
  if (!fundraiser) notFound();
  const donations = await getDonationsByFundraiserId(fundraiser.id);
  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const pageUrl = `https://www.soccer-near-me.com/fundraiser/${slug}`;

  return (
    <>
      {/* Hero */}
      <div className="relative">
        <img
          src={fundraiser.heroImageUrl || DEFAULT_HERO}
          alt={fundraiser.title}
          className="w-full h-[280px] sm:h-[360px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-6 pb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            {fundraiser.title}
          </h1>
          {!fundraiser.active && (
            <span className="inline-block mt-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Fundraiser Closed
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

          {/* Main Content */}
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <span className="text-3xl font-extrabold text-accent">${(totalRaised / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  <span className="text-muted text-sm ml-1">raised</span>
                </div>
                {fundraiser.goal && (
                  <span className="text-sm text-muted">
                    of ${(fundraiser.goal / 100).toLocaleString("en-US")} goal
                  </span>
                )}
              </div>
              {fundraiser.goal && fundraiser.goal > 0 && (
                <div className="w-full bg-surface rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-accent h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalRaised / fundraiser.goal) * 100)}%` }}
                  />
                </div>
              )}
              <p className="text-sm text-muted mt-2">{donations.length} donation{donations.length !== 1 ? "s" : ""}</p>
              {fundraiser.active && (
                <a
                  href={`/fundraiser/${slug}/donate`}
                  className="block w-full mt-4 py-3 rounded-xl bg-[#DC373E] text-white text-center font-bold text-lg hover:bg-[#C42F36] transition-colors"
                >
                  Donate Now
                </a>
              )}
            </div>

            {/* Description */}
            {fundraiser.description && (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-3">About This Fundraiser</h2>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{fundraiser.description}</p>
              </div>
            )}

            {/* Donations */}
            {donations.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-4">
                  Supporters ({donations.length})
                </h2>
                <div className="space-y-3">
                  {donations.map((d) => (
                    <div key={d.id} className="flex items-start gap-3 p-3 rounded-xl border border-border">
                      <div className="w-10 h-10 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0 text-sm">
                        {d.donorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <span className="font-bold text-sm text-primary">{d.donorName}</span>
                          <span className="font-bold text-sm text-accent">${(d.amount / 100).toFixed(2)}</span>
                        </div>
                        {d.onBehalfOf && <p className="text-xs text-muted">On behalf of {d.onBehalfOf}</p>}
                        {d.donorMessage && <p className="text-sm text-muted mt-1">{d.donorMessage}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact */}
            {(fundraiser.coachName || fundraiser.coachEmail || fundraiser.coachPhone) && (
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="font-[family-name:var(--font-display)] text-sm font-bold text-primary mb-3">Contact</h3>
                {fundraiser.coachName && <p className="text-sm font-medium text-primary">{fundraiser.coachName}</p>}
                {fundraiser.coachEmail && (
                  <a href={`mailto:${fundraiser.coachEmail}`} className="text-sm text-accent hover:text-accent-hover block mt-1">{fundraiser.coachEmail}</a>
                )}
                {fundraiser.coachPhone && <p className="text-sm text-muted mt-1">{fundraiser.coachPhone}</p>}
              </div>
            )}

            {/* Social Links */}
            {(fundraiser.websiteUrl || fundraiser.facebookUrl || fundraiser.instagramUrl) && (
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="font-[family-name:var(--font-display)] text-sm font-bold text-primary mb-3">Links</h3>
                <div className="space-y-2">
                  {fundraiser.websiteUrl && (
                    <a href={fundraiser.websiteUrl.startsWith("http") ? fundraiser.websiteUrl : `https://${fundraiser.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover">
                      <span>&#127760;</span> Website
                    </a>
                  )}
                  {fundraiser.facebookUrl && (
                    <a href={fundraiser.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover">
                      <span>&#128101;</span> Facebook
                    </a>
                  )}
                  {fundraiser.instagramUrl && (
                    <a href={fundraiser.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover">
                      <span>&#128247;</span> Instagram
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <h3 className="font-[family-name:var(--font-display)] text-sm font-bold text-primary mb-3">Share</h3>
              <ShareButtons url={pageUrl} title={fundraiser.title} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
