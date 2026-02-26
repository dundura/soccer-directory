"use client";

import { useState, useEffect } from "react";

interface ReviewData {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export function ReviewSection({ listingType, listingId }: { listingType: string; listingId: string }) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reviews/${listingType}/${listingId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.averageRating || 0);
        setReviewCount(data.reviewCount || 0);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [listingType, listingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingType, listingId, reviewerName: name, reviewerRole: role, rating, reviewText: text }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

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

  if (!loaded) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-[15px] font-bold text-primary mb-3.5 flex items-center gap-2">
        Reviews
        {reviewCount > 0 && (
          <span className="text-sm font-normal text-muted">
            <Stars count={Math.round(avgRating)} size="text-sm" /> {avgRating} ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
          </span>
        )}
      </h3>

      {/* Existing reviews */}
      {reviews.length > 0 ? (
        <div className="space-y-4 mb-6">
          {reviews.map((r) => (
            <div key={r.id} className="border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-primary">{r.reviewerName}</span>
                  <span className="text-xs bg-surface text-muted px-2 py-0.5 rounded-full">{r.reviewerRole}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Verified Review</span>
                </div>
                <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <Stars count={r.rating} />
              <p className="text-sm text-muted mt-2 leading-relaxed">{r.reviewText}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted mb-6">No reviews yet. Be the first to leave a review!</p>
      )}

      {/* Submit form */}
      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-green-700 font-semibold text-sm">Your review has been submitted and is pending approval.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border-t border-border pt-4 space-y-3">
          <h4 className="text-sm font-bold text-primary">Leave a Review</h4>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} />
            <select required value={role} onChange={(e) => setRole(e.target.value)} className={inputClass + " bg-white"}>
              <option value="">Your role...</option>
              <option value="Parent">Parent</option>
              <option value="Player">Player</option>
              <option value="Coach">Coach</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <span className="text-sm text-muted mr-2">Rating:</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-2xl transition-colors ${i <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"}`}
              >
                {"\u2605"}
              </button>
            ))}
          </div>
          <textarea required value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Write your review..." className={inputClass + " resize-none"} />
          {error && <p className="text-accent text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}
