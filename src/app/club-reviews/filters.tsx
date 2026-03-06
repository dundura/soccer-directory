"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { ClubReview, ClubReviewComment } from "@/lib/db";
import { EmptyState, AnytimeInlineCTA } from "@/components/ui";

const PER_PAGE = 10;
const HELPFUL_THRESHOLD = 3;

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

type ClubSuggestion = { id: string; name: string; city: string; state: string; slug: string };

function ReviewForm({ onSuccess, initial, isEdit }: {
  onSuccess: () => void;
  initial?: ClubReview;
  isEdit?: boolean;
}) {
  const [clubName, setClubName] = useState(initial?.clubName || "");
  const [clubId, setClubId] = useState(initial?.clubId || "");
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
  const [suggestions, setSuggestions] = useState<ClubSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  function handleClubSearch(value: string) {
    setClubName(value);
    setClubId("");
    if (searchTimer) clearTimeout(searchTimer);
    if (value.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/club-reviews/search-clubs?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch { /* ignore */ }
    }, 300);
    setSearchTimer(timer);
  }

  function selectClub(club: ClubSuggestion) {
    setClubName(club.name);
    setClubId(club.id);
    setCity(club.city);
    setState(club.state);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingPrice || !ratingQuality || !ratingCoaching) {
      setError("Please rate all three categories");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const body = { clubName, clubId: clubId || undefined, city, state, ratingPrice, ratingQuality, ratingCoaching, reviewerName, reviewerRole, reviewText, ...(isEdit && initial ? { id: initial.id } : {}) };
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
        <div className="relative">
          <input
            type="text"
            required
            value={clubName}
            onChange={(e) => handleClubSearch(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search for a club or type a new name *"
            className={inputClass}
            autoComplete="off"
          />
          {clubId && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Linked</span>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectClub(club)}
                  className="w-full text-left px-4 py-3 hover:bg-surface transition-colors border-b border-border last:border-b-0"
                >
                  <div className="font-semibold text-sm text-primary">{club.name}</div>
                  <div className="text-xs text-muted">{club.city}, {club.state}</div>
                </button>
              ))}
              <div className="px-4 py-2 bg-surface/50 text-xs text-muted">
                Don&apos;t see your club? Just type the name above.
              </div>
            </div>
          )}
        </div>
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
        <input type="text" required value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Display Name / Nickname *" className={inputClass} />
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

// ── Vote Buttons ──────────────────────────────────────────────
function VoteButtons({ reviewId, initialLikes, initialDislikes, userVote, isLoggedIn }: {
  reviewId: string; initialLikes: number; initialDislikes: number; userVote?: string; isLoggedIn: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [myVote, setMyVote] = useState(userVote);
  const [voting, setVoting] = useState(false);

  async function handleVote(voteType: "like" | "dislike") {
    if (!isLoggedIn) { window.location.href = "/dashboard"; return; }
    setVoting(true);
    try {
      const res = await fetch(`/api/club-reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setMyVote(myVote === voteType ? undefined : voteType);
      }
    } catch { /* ignore */ }
    setVoting(false);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleVote("like")}
        disabled={voting}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
          myVote === "like" ? "bg-green-100 text-green-700" : "bg-surface text-muted hover:bg-green-50 hover:text-green-600"
        }`}
        title="Helpful"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
        </svg>
        {likes > 0 && likes}
      </button>
      <button
        onClick={() => handleVote("dislike")}
        disabled={voting}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
          myVote === "dislike" ? "bg-red-100 text-red-700" : "bg-surface text-muted hover:bg-red-50 hover:text-red-600"
        }`}
        title="Not helpful"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
        </svg>
        {dislikes > 0 && dislikes}
      </button>
    </div>
  );
}

// ── Comments Section ──────────────────────────────────────────
function CommentsSection({ reviewId, isLoggedIn, userId }: { reviewId: string; isLoggedIn: boolean; userId?: string }) {
  const [comments, setComments] = useState<ClubReviewComment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [nickname, setNickname] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (expanded && !loaded) {
      fetch(`/api/club-reviews/${reviewId}/comments`)
        .then((r) => r.json())
        .then((data) => { setComments(data); setLoaded(true); })
        .catch(() => setLoaded(true));
    }
  }, [expanded, loaded, reviewId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/club-reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, nickname: nickname.trim() || undefined }),
      });
      const json = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, {
          id: json.id, reviewId, userId: userId || "",
          userName: json.userName || nickname.trim() || session?.user?.name || "You",
          body: body.trim(), createdAt: new Date().toISOString(),
        }]);
        setBody("");
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/club-reviews/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch { /* ignore */ }
  }

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
      >
        {expanded ? "Hide Comments" : `Comments${comments.length > 0 ? ` (${comments.length})` : ""}`}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {loaded && comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="bg-surface rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-primary">{c.userName}</span>
                      <span className="text-xs text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    {userId === c.userId && (
                      <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                    )}
                  </div>
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{c.body}</p>
                </div>
              ))}
            </div>
          )}
          {loaded && comments.length === 0 && (
            <p className="text-xs text-muted">No comments yet.</p>
          )}

          {isLoggedIn ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Nickname (optional)"
                className="sm:w-36 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <input
                type="text"
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 shrink-0"
              >
                {submitting ? "..." : "Post"}
              </button>
            </form>
          ) : (
            <a href="/dashboard" className="text-xs text-accent hover:text-accent-hover font-semibold">Sign in to comment</a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export function ClubReviewFilters({ reviews: initialReviews }: { reviews: ClubReview[] }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const isLoggedIn = !!session?.user;
  const [reviews, setReviews] = useState(initialReviews);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ClubReview | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch user's votes
  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/club-reviews/votes")
        .then((r) => r.json())
        .then(setUserVotes)
        .catch(() => {});
    }
  }, [isLoggedIn]);

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
                if (!isLoggedIn) { window.location.href = "/dashboard"; return; }
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">
                            {review.clubName}
                          </h3>
                          {review.clubSlug && (
                            <a href={`/clubs/${review.clubSlug}`} className="text-xs text-accent hover:text-accent-hover font-medium transition-colors">View Profile</a>
                          )}
                          {review.likes >= HELPFUL_THRESHOLD && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              Helpful
                            </span>
                          )}
                        </div>
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

                    <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
                      <span className="font-bold text-primary">{review.reviewerName}</span>
                      {review.reviewerRole && (
                        <span className="bg-surface px-2 py-0.5 rounded-full">{review.reviewerRole}</span>
                      )}
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Verified Review</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>

                      <div className="ml-auto flex items-center gap-2">
                        <VoteButtons
                          reviewId={review.id}
                          initialLikes={review.likes}
                          initialDislikes={review.dislikes}
                          userVote={userVotes[review.id]}
                          isLoggedIn={isLoggedIn}
                        />

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

                    {/* Comments */}
                    <CommentsSection reviewId={review.id} isLoggedIn={isLoggedIn} userId={currentUserId} />
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
