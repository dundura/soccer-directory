import { getActiveFundraisers } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fundraisers | Soccer Near Me",
  description: "Support youth soccer teams and clubs. Browse active fundraisers and make a donation.",
};

export default async function FundraisersPage() {
  const fundraisers = await getActiveFundraisers();

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Fundraisers
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-6">
            Support youth soccer teams and clubs by donating to their fundraisers.
          </p>
          <a
            href="/fundraiser/new"
            className="inline-block px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-colors"
          >
            Start a Fundraiser
          </a>
        </div>
      </div>

      {/* Fundraiser Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {fundraisers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg mb-4">No active fundraisers yet.</p>
            <a href="/fundraiser/new" className="text-accent hover:text-accent-hover font-semibold">
              Be the first to create one &rarr;
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundraisers.map((f) => {
              const goalCents = f.goal || 0;
              const raisedCents = f.totalRaised || 0;
              const pct = goalCents > 0 ? Math.min(100, Math.round((raisedCents / goalCents) * 100)) : 0;

              return (
                <a
                  key={f.id}
                  href={`/fundraiser/${f.slug}`}
                  className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="h-44 bg-surface overflow-hidden">
                    {f.heroImageUrl ? (
                      <img
                        src={f.heroImageUrl}
                        alt={f.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-muted/30">
                        ⚽
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-[family-name:var(--font-display)] font-bold text-primary text-lg mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                      {f.title}
                    </h3>
                    {f.description && (
                      <p className="text-muted text-sm line-clamp-2 mb-3">{f.description}</p>
                    )}

                    {/* Progress */}
                    <div className="mt-auto">
                      <div className="flex items-baseline justify-between text-sm mb-1">
                        <span className="font-bold text-primary">
                          ${(raisedCents / 100).toLocaleString()} raised
                        </span>
                        {goalCents > 0 && (
                          <span className="text-muted">
                            of ${(goalCents / 100).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {goalCents > 0 && (
                        <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                      {f.donorCount !== undefined && f.donorCount > 0 && (
                        <p className="text-xs text-muted mt-1">
                          {f.donorCount} {f.donorCount === 1 ? "donor" : "donors"}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
