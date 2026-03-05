"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ImageUpload } from "@/components/image-upload";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export default function JoinRosterPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [invite, setInvite] = useState<{ fundraiserTitle: string; fundraiserSlug: string; email: string; inviteStatus: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setError("No invite token found"); setLoading(false); return; }
    fetch(`/api/fundraiser/roster-accept?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); } else { setInvite(data); }
      })
      .catch(() => setError("Failed to load invite"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (session?.user?.name && !playerName) setPlayerName(session.user.name);
  }, [session, playerName]);

  if (loading) return <div className="max-w-xl mx-auto px-6 py-20 text-center text-muted">Loading...</div>;
  if (error) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-2xl border border-border p-10 shadow-lg">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-2">Invalid Invite</h1>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <div className="bg-white rounded-2xl border border-border p-10 shadow-lg">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-2">You're on the Roster!</h1>
            <p className="text-muted mb-6">You've successfully joined <strong>{invite?.fundraiserTitle}</strong>. Supporters can now donate on your behalf.</p>
            <a href={`/fundraiser/${invite?.fundraiserSlug}`} className="inline-block px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-colors">
              View Fundraiser
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (invite?.inviteStatus === "accepted") {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <div className="bg-white rounded-2xl border border-border p-10 shadow-lg">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-2">Already Joined</h1>
            <p className="text-muted mb-6">This invite has already been accepted.</p>
            <a href={`/fundraiser/${invite.fundraiserSlug}`} className="inline-block px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-colors">
              View Fundraiser
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <div className="bg-white rounded-2xl border border-border p-10 shadow-lg">
            <span className="text-5xl block mb-4">&#9917;</span>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-2">Join {invite?.fundraiserTitle}</h1>
            <p className="text-muted mb-6">Sign in or create a free account to join the roster and start receiving donations.</p>
            <a
              href={`/api/auth/signin?callbackUrl=${encodeURIComponent(`/fundraiser/join?token=${token}`)}`}
              className="inline-block px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-colors"
            >
              Sign In / Create Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const res = await fetch("/api/fundraiser/roster-accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, playerName, position, ageGroup, photoUrl, bio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-1">Join the Roster</h1>
        <p className="text-muted mb-6">Complete your profile to join <strong>{invite?.fundraiserTitle}</strong></p>

        <div className="bg-white rounded-2xl border border-border p-6 md:p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Your Name <span className="text-accent">*</span></label>
              <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className={inputClass} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-1">Position</label>
                <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass} placeholder="e.g. Forward" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-1">Age Group</label>
                <input type="text" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={inputClass} placeholder="e.g. U14" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Photo</label>
              {photoUrl && <img src={photoUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover mb-2" />}
              <ImageUpload onUploaded={(url) => setPhotoUrl(url)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Short Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={inputClass} placeholder="Tell supporters a bit about yourself..." />
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

            <button type="submit" disabled={saving} className="w-full py-3.5 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent-hover transition-colors disabled:opacity-50">
              {saving ? "Joining..." : "Join the Roster"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
