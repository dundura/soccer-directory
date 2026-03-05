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

function ProgressRing({ pct, color, label, value, sub }: { pct: number; color: "navy" | "red"; label: string; value: string; sub: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const strokeColor = color === "red" ? "#DC373E" : "var(--color-primary)";
  const valueClass = color === "red" ? "text-[#DC373E]" : "text-primary";

  return (
    <div className="text-center">
      <svg width="90" height="90" viewBox="0 0 90 90" className="block mx-auto mb-1.5">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#e8edf4" strokeWidth="8" />
        <circle
          cx="45" cy="45" r={r} fill="none"
          stroke={strokeColor} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          className="transition-all duration-700"
        />
        <text x="45" y="50" textAnchor="middle" className="fill-primary" style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700 }}>
          {pct}%
        </text>
      </svg>
      <div className={`font-[family-name:var(--font-display)] text-xl font-bold ${valueClass}`}>{value}</div>
      <div className="text-[11px] text-muted mt-0.5">{sub}</div>
      <div className="text-xs text-muted font-medium mt-1">{label}</div>
    </div>
  );
}

export default async function FundraiserPage({ params }: Props) {
  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);
  if (!fundraiser) notFound();
  const donations = await getDonationsByFundraiserId(fundraiser.id);
  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const goalCents = fundraiser.goal || 0;
  const pct = goalCents > 0 ? Math.min(100, Math.round((totalRaised / goalCents) * 100)) : 0;
  const pageUrl = `https://www.soccer-near-me.com/fundraiser/${slug}`;

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-[1100px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Hero Image */}
          {fundraiser.heroImageUrl && (
            <img
              src={fundraiser.heroImageUrl}
              alt={fundraiser.title}
              className="w-full rounded-xl object-cover mb-5"
              style={{ maxHeight: 260 }}
            />
          )}

          {/* Title & Status */}
          <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold text-primary mb-2 leading-tight">
            {fundraiser.title}
          </h1>
          {!fundraiser.active && (
            <span className="inline-block mb-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Fundraiser Closed
            </span>
          )}

          {/* About Card */}
          {fundraiser.description && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(15,30,53,0.10)] mt-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-3 pb-2.5 border-b-2 border-border">
                About This Fundraiser
              </h2>
              <p className="text-[15px] leading-[1.7] text-primary/80 whitespace-pre-line">{fundraiser.description}</p>
            </div>
          )}

          {/* Supporters Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(15,30,53,0.10)] mt-6">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary pb-2.5 border-b-2 border-border mb-1">
              Supporters{" "}
              <span className="font-normal text-muted text-base">({donations.length})</span>
            </h2>

            {donations.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">Be the first to support this fundraiser!</p>
            ) : (
              <div>
                {donations.map((d) => {
                  const initials = d.donorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <div key={d.id} className="flex items-center gap-3.5 py-3 border-b border-border last:border-b-0">
                      <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-primary to-[#2a5298] flex items-center justify-center text-white font-[family-name:var(--font-display)] text-lg font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-primary">{d.donorName}</div>
                        <div className="text-[13px] text-muted mt-0.5">
                          Donated ${(d.amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          {d.onBehalfOf ? ` — on behalf of ${d.onBehalfOf}` : ""}
                        </div>
                        {d.donorMessage && <p className="text-sm text-muted/80 mt-1 italic">&ldquo;{d.donorMessage}&rdquo;</p>}
                      </div>
                      <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                        Donor
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5 lg:sticky lg:top-20">
          {/* Support Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(15,30,53,0.10)]">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary text-center mb-5">
              Support This Fundraiser
            </h3>

            {/* Progress Rings */}
            <div className="flex justify-center gap-8 mb-6">
              <ProgressRing
                pct={pct}
                color="navy"
                label="Fundraising Goal"
                value={`$${(totalRaised / 100).toLocaleString("en-US")}`}
                sub={goalCents > 0 ? `raised of $${(goalCents / 100).toLocaleString("en-US")}` : "total raised"}
              />
              <ProgressRing
                pct={donations.length > 0 ? Math.min(100, donations.length * 10) : 0}
                color="red"
                label="Donations"
                value={`${donations.length}`}
                sub={donations.length === 1 ? "supporter" : "supporters"}
              />
            </div>

            {/* Give Now Button */}
            {fundraiser.active && (
              <a
                href={`/fundraiser/${slug}/donate`}
                className="block w-full py-3.5 rounded-lg bg-[#DC373E] text-white text-center font-[family-name:var(--font-display)] text-xl font-bold tracking-wide hover:bg-[#C42F36] transition-all hover:-translate-y-0.5 mb-2.5"
              >
                Give Now
              </a>
            )}

            {/* Share Button */}
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(fundraiser.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-lg bg-white text-primary border-2 border-border text-center font-[family-name:var(--font-display)] text-lg font-bold hover:border-primary transition-colors mb-5"
            >
              Share
            </a>

            {/* Social Share */}
            <div className="text-center">
              <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">Share this fundraiser</p>
              <ShareButtons url={pageUrl} title={fundraiser.title} />
            </div>
          </div>

          {/* Organizer Card */}
          {(fundraiser.coachName || fundraiser.coachEmail || fundraiser.coachPhone) && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(15,30,53,0.10)] text-center">
              <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-primary to-[#1a4080] border-[3px] border-[#DC373E] flex items-center justify-center mx-auto mb-3">
                <span className="font-[family-name:var(--font-display)] text-xl font-extrabold text-white">
                  {(fundraiser.coachName || "?")[0].toUpperCase()}
                </span>
              </div>
              {fundraiser.coachName && (
                <h4 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-1">{fundraiser.coachName}</h4>
              )}
              <p className="text-[13px] text-muted mb-2">Organizer</p>
              {fundraiser.coachEmail && (
                <a href={`mailto:${fundraiser.coachEmail}`} className="block text-[13px] text-[#DC373E] hover:underline mb-0.5">{fundraiser.coachEmail}</a>
              )}
              {fundraiser.coachPhone && (
                <a href={`tel:${fundraiser.coachPhone}`} className="block text-[13px] text-[#DC373E] hover:underline">{fundraiser.coachPhone}</a>
              )}
              {/* Social links */}
              {(fundraiser.websiteUrl || fundraiser.facebookUrl || fundraiser.instagramUrl) && (
                <div className="flex justify-center gap-3 mt-4">
                  {fundraiser.websiteUrl && (
                    <a href={fundraiser.websiteUrl.startsWith("http") ? fundraiser.websiteUrl : `https://${fundraiser.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary hover:bg-border transition-colors text-sm" title="Website">
                      &#127760;
                    </a>
                  )}
                  {fundraiser.facebookUrl && (
                    <a href={fundraiser.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary hover:bg-border transition-colors text-sm font-bold" title="Facebook">
                      f
                    </a>
                  )}
                  {fundraiser.instagramUrl && (
                    <a href={fundraiser.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-primary hover:bg-border transition-colors text-sm font-bold italic" title="Instagram">
                      in
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
