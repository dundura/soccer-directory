"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

interface ReviewData {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  isInvited?: boolean;
}

interface InvitationRecord {
  email: string;
  name: string | null;
  status: string;
  createdAt: string;
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export function ReviewSection({ listingType, listingId }: { listingType: string; listingId: string }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const reviewToken = searchParams.get("reviewToken");
  const isLoggedIn = !!session?.user;

  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Invite state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const isOwner = isLoggedIn && (ownerId === session?.user?.id || isAdmin);
  const canSubmit = isLoggedIn || !!reviewToken;

  useEffect(() => {
    fetch(`/api/reviews/${listingType}/${listingId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.averageRating || 0);
        setReviewCount(data.reviewCount || 0);
        setOwnerId(data.ownerId || null);
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
        body: JSON.stringify({
          listingType, listingId,
          reviewerName: name, reviewerRole: role,
          rating, reviewText: text,
          invitationToken: reviewToken || undefined,
        }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      const result = await res.json();
      setSubmitted(true);
      if (result.autoApproved) {
        // Refresh reviews to show the new one immediately
        fetch(`/api/reviews/${listingType}/${listingId}`)
          .then((r) => r.json())
          .then((data) => {
            setReviews(data.reviews || []);
            setAvgRating(data.averageRating || 0);
            setReviewCount(data.reviewCount || 0);
          })
          .catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      const res = await fetch("/api/reviews/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingType, listingId, email: inviteEmail, name: inviteName }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      setInviteSuccess(`Invitation sent to ${inviteEmail}`);
      setInvitations((prev) => [{ email: inviteEmail, name: inviteName || null, status: "pending", createdAt: new Date().toISOString() }, ...prev]);
      setInviteEmail("");
      setInviteName("");
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  }

  // Load invitations when owner opens invite panel
  useEffect(() => {
    if (showInvite && isOwner && invitations.length === 0) {
      fetch(`/api/reviews/${listingType}/${listingId}`)
        .then(() => {
          // We don't have a separate invitations endpoint yet, so we skip pre-loading
        })
        .catch(() => {});
    }
  }, [showInvite, isOwner, invitations.length, listingType, listingId]);

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
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-[15px] font-bold text-primary flex items-center gap-2">
          Reviews
          {reviewCount > 0 && (
            <span className="text-sm font-normal text-muted">
              <Stars count={Math.round(avgRating)} size="text-sm" /> {avgRating} ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
            </span>
          )}
        </h3>
        {isOwner && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Invite Reviews
          </button>
        )}
      </div>

      {/* Invite Form (owner only) */}
      {showInvite && isOwner && (
        <div className="bg-surface rounded-xl p-4 mb-4">
          <h4 className="text-sm font-bold text-primary mb-2">Invite Someone to Review</h4>
          <p className="text-xs text-muted mb-3">Send an email invitation. Their review will be auto-approved.</p>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address *"
              className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Name (optional)"
              className="sm:w-40 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            <button
              type="submit"
              disabled={inviting}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 shrink-0"
            >
              {inviting ? "Sending..." : "Send Invite"}
            </button>
          </form>
          {inviteSuccess && <p className="text-green-600 text-xs mt-2 font-medium">{inviteSuccess}</p>}
          {inviteError && <p className="text-[#DC373E] text-xs mt-2">{inviteError}</p>}

          {invitations.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs font-semibold text-muted mb-2">Recent Invitations</p>
              <div className="space-y-1">
                {invitations.map((inv, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-primary">{inv.email}</span>
                    {inv.name && <span className="text-muted">({inv.name})</span>}
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${inv.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {inv.status === "completed" ? "Reviewed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing reviews */}
      {reviews.length > 0 ? (
        <div className="space-y-4 mb-6">
          {reviews.map((r) => (
            <div key={r.id} className="border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-primary">{r.reviewerName}</span>
                  <span className="text-xs bg-surface text-muted px-2 py-0.5 rounded-full">{r.reviewerRole}</span>
                  {r.isInvited && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Verified Review</span>
                  )}
                </div>
                <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <Stars count={r.rating} />
              {r.reviewText && <p className="text-sm text-muted mt-2 leading-relaxed">{r.reviewText}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted mb-6">No reviews yet. Be the first to leave a review!</p>
      )}

      {/* Submit form */}
      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-green-700 font-semibold text-sm">
            {reviewToken
              ? "Thank you! Your review has been published."
              : "Your review has been submitted and is pending approval."}
          </p>
        </div>
      ) : canSubmit ? (
        <form onSubmit={handleSubmit} className="border-t border-border pt-4 space-y-3">
          <h4 className="text-sm font-bold text-primary">
            {reviewToken ? "You've been invited to leave a review" : "Leave a Review"}
          </h4>
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
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Share your experience (optional)" className={inputClass + " resize-none"} />
          {error && <p className="text-accent text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted">
            <a href="/dashboard" className="text-accent hover:text-accent-hover font-semibold">Sign in</a> to leave a review.
          </p>
        </div>
      )}
    </div>
  );
}
