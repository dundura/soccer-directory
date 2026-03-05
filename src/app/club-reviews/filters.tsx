"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { ClubReview } from "@/lib/db";
import { EmptyState, AnytimeInlineCTA } from "@/components/ui";

const PER_PAGE = 10;

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming", "Washington D.C.",
];

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

function Stars({ count, size = "text-lg" }: { count: number; size?: string }) {
  return (
    <span className={size}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= count ? "text-yellow-400" : "text-gray-300"}>
          {"\u2605"}
        </span>
      ))}
    </span>
  );
}

function StarInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-primary w-20">{label}</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className={`text-2xl transition-colors ${i <= (hover || value) ? "text-yellow-400" : "text-gray-300"}`}
          >
            {"\u2605"}
          </button>
        ))}
      </div>
      {value > 0 && <span className="text-xs text-muted">{value}/5</span>}
    </div>
  );
}

function ReviewForm({ onSuccess, initial, isEdit }: {
  onSuccess: () => void;
  initial?: ClubReview;
  isEdit?: boolean;
}) {
  const [clubName, setClubName] = useState(initial?.clubName || "");
  const [city, setCity] = useState(initial?.city || "");
  const [state, setState] = useState(initial?.state || "");
  const [ratingPrice, setRatingPrice] = useState(initial?.ratingPrice || 0);
  const [ratingQuality, setRatingQuality] = useState(initial?.ratingQuality || 0);
  const [ratingCoaching, setRatingCoaching] = useState(initial?.ratingCoaching || 0);
  const [reviewerName, setReviewerName] = useState(initial?.reviewerName || "");
  const [reviewerRole, setReviewerRole] = useState(initial?.reviewerRole || "");
  const [reviewText, setReviewText] = useState(initial?.reviewText || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingPrice || !ratingQuality || !ratingCoaching) {
      setError("Please rate all three categories");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const body = { clubName, city, state, ratingPrice, ratingQuality, ratingCoaching, reviewerName, reviewerRole, reviewText, ...(isEdit && initial ? { id: initial.id } : {}) };
      const res = await fetch("/api/club-reviews", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error);
      }
      setSubmitted(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">&#10003;</div>
        <p className="text-green-700 font-semibold">
          {isEdit ? "Your review has been updated and is pending re-approval." : "Your review has been submitted and is pending approval."}
        </p>
        <p className="text-green-600 text-sm mt-1">We review all submissions to ensure quality. Your review will appear once approved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input type="text" required value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Club Name *" className={inputClass} />
        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputClass} />
        <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass + " bg-white"}>
          <option value="">State</option>
          {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-surface rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-primary mb-2">Rate this club:</p>
        <StarInput label="Price" value={ratingPrice} onChange={setRatingPrice} />
        <StarInput label="Quality" value={ratingQuality} onChange={setRatingQuality} />
        <StarInput label="Coaching" value={ratingCoaching} onChange={setRatingCoaching} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="text" required value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Your Name *" className={inputClass} />
        <select value={reviewerRole} onChange={(e) => setReviewerRole(e.target.value)} className={inputClass + " bg-white"}>
          <option value="">Your role...</option>
          <option value="Parent">Parent</option>
          <option value="Player">Player</option>
          <option value="Coach">Coach</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} placeholder="Share your experience (optional)" className={inputClass + " resize-none"} />

      {error && <p className="text-[#DC373E] text-sm">{error}</p>}

      <button type="submit" disabled={submitting} className="px-8 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
        {submitting ? "Saving..." : isEdit ? "Update Review" : "Submit Review"}
      </button>
    </form>
  );
}

export function ClubReviewFilters({ reviews: initialReviews }: { reviews: ClubReview[] }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ClubReview | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const states = [...new Set(reviews.map((r) => r.state).filter(Boolean))].sort();
  const cities = [...new Set(
    reviews
      .filter((r) => !stateFilter || r.state === stateFilter)
      .map((r) => r.city)
      .filter(Boolean)
  )].sort();

  const filtered = reviews.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !r.clubName.toLowerCase().includes(q) &&
        !r.city.toLowerCase().includes(q) &&
        !r.state.toLowerCase().includes(q) &&
        !r.reviewerName.toLowerCase().includes(q) &&
        !r.reviewText.toLowerCase().includes(q)
      ) return false;
    }
    if (stateFilter && r.state !== stateFilter) return false;
    if (cityFilter && r.city !== cityFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const visible = viewAll ? sorted : sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  async function refreshReviews() {
    try {
      const res = await fetch("/api/club-reviews");
      if (res.ok) setReviews(await res.json());
    } catch { /* ignore */ }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/club-reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch { /* ignore */ }
    setDeleting(null);
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Club Reviews
          </h1>
          <p className="text-white/70 max-w-2xl text-lg mb-8">
            Read honest reviews from parents, players, and coaches. Rate clubs on price, quality, and coaching.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by club name, city, reviewer..."
              className="flex-1 px-5 py-4 rounded-xl text-primary text-base placeholder:text-muted focus:outline-none"
            />
            <select
              value={stateFilter}
              onChange={(e) => { setStateFilter(e.target.value); setCityFilter(""); setPage(1); }}
              className="px-4 py-4 rounded-xl border border-border text-sm font-medium text-primary bg-surface focus:outline-none cursor-pointer sm:w-48"
            >
              <option value="">All States</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {cities.length > 0 && (
              <select
                value={cityFilter}
                onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                className="px-4 py-4 rounded-xl border border-border text-sm font-medium text-primary bg-surface focus:outline-none cursor-pointer sm:w-48"
              >
                <option value="">All Cities</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <button
              type="button"
              onClick={() => {
                if (!session?.user) {
                  window.location.href = "/dashboard";
                  return;
                }
                setEditingReview(null);
                setShowForm(!showForm);
              }}
              className="px-8 py-4 rounded-xl bg-accent text-white font-semibold text-base hover:bg-accent-hover transition-colors whitespace-nowrap"
            >
              Write a Review
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Review Form (create) */}
        {showForm && !editingReview && (
          <div className="bg-white rounded-2xl border border-border p-6 md:p-8 mt-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4">Write a Club Review</h2>
            <p className="text-muted text-sm mb-6">All reviews are moderated before being published.</p>
            <ReviewForm onSuccess={() => { setShowForm(false); refreshReviews(); }} />
          </div>
        )}

        {/* Edit Form */}
        {editingReview && (
          <div className="bg-white rounded-2xl border border-border p-6 md:p-8 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Edit Your Review</h2>
              <button onClick={() => setEditingReview(null)} className="text-sm text-muted hover:text-primary transition-colors">Cancel</button>
            </div>
            <p className="text-muted text-sm mb-6">Edited reviews go back to pending approval.</p>
            <ReviewForm initial={editingReview} isEdit onSuccess={() => { setEditingReview(null); refreshReviews(); }} />
          </div>
        )}

        {/* Result count */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <p className="text-sm text-muted">
            {sorted.length} review{sorted.length !== 1 ? "s" : ""} found
            {!viewAll && sorted.length > PER_PAGE && <> &middot; Page {page} of {totalPages}</>}
          </p>
          {sorted.length > PER_PAGE && (
            <button
              onClick={() => { setViewAll(!viewAll); setPage(1); }}
              className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
            >
              {viewAll ? "Show Pages" : "View All"}
            </button>
          )}
        </div>

        {sorted.length === 0 ? (
          <EmptyState message="No reviews yet. Be the first to review a club!" />
        ) : (
          <>
            <div className="space-y-4">
              {visible.map((review) => {
                const isOwner = currentUserId && review.userId === currentUserId;
                return (
                  <div key={review.id} className="bg-white rounded-2xl border border-border p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">
                          {review.clubName}
                        </h3>
                        {(review.city || review.state) && (
                          <p className="text-muted text-sm">{[review.city, review.state].filter(Boolean).join(", ")}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Stars count={Math.round(review.overallRating)} />
                        <span className="text-sm font-semibold text-primary">{review.overallRating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Rating breakdown */}
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wide">Price</span>
                        <Stars count={review.ratingPrice} size="text-sm" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wide">Quality</span>
                        <Stars count={review.ratingQuality} size="text-sm" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wide">Coaching</span>
                        <Stars count={review.ratingCoaching} size="text-sm" />
                      </div>
                    </div>

                    {review.reviewText && (
                      <p className="text-sm text-muted leading-relaxed mb-3 whitespace-pre-wrap">{review.reviewText}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="font-bold text-primary">{review.reviewerName}</span>
                      {review.reviewerRole && (
                        <span className="bg-surface px-2 py-0.5 rounded-full">{review.reviewerRole}</span>
                      )}
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Verified Review</span>
                      <span className="ml-auto">{new Date(review.createdAt).toLocaleDateString()}</span>

                      {isOwner && (
                        <>
                          <button
                            onClick={() => { setEditingReview(review); setShowForm(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className="px-3 py-1 rounded-lg bg-accent/10 text-accent-hover text-xs font-medium hover:bg-accent/20 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            disabled={deleting === review.id}
                            className="px-3 py-1 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deleting === review.id ? "..." : "Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {!viewAll && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &larr; Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      p === page ? "bg-primary text-white" : "border border-border hover:bg-surface"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => { setPage(Math.min(totalPages, page + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next &rarr;
                </button>
              </div>
            )}

            <div className="mt-8"><AnytimeInlineCTA /></div>
          </>
        )}
      </div>
    </>
  );
}
