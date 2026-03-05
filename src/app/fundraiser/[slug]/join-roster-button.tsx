"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ImageUpload } from "@/components/image-upload";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export function JoinRosterButton({ slug }: { slug: string }) {
  const { data: session, status: authStatus } = useSession();
  const [rosterStatus, setRosterStatus] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetch(`/api/fundraiser/${slug}/join`)
        .then(r => r.json())
        .then(data => setRosterStatus(data.status))
        .catch(() => {});
    }
  }, [authStatus, slug]);

  useEffect(() => {
    if (session?.user?.name && !playerName) setPlayerName(session.user.name);
  }, [session, playerName]);

  // Don't show button if already on roster
  if (rosterStatus === "accepted") return null;
  if (rosterStatus === "requested") {
    return (
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Your request to join is pending approval
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="mt-4 text-center">
        {authStatus === "unauthenticated" ? (
          <a
            href={`/api/auth/signin?callbackUrl=${encodeURIComponent(`/fundraiser/${slug}`)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Join our Roster
          </a>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Join our Roster
          </button>
        )}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!playerName.trim()) { setError("Name is required"); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch(`/api/fundraiser/${slug}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, position, ageGroup, photoUrl, bio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setRosterStatus("requested");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-primary mb-3">Request to Join the Roster</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Your Name <span className="text-accent">*</span></label>
            <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Position</label>
              <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass} placeholder="e.g. Forward" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Age Group</label>
              <input type="text" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={inputClass} placeholder="e.g. U14" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Photo</label>
            {photoUrl && <img src={photoUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover mb-2" />}
            <ImageUpload onUploaded={(url) => setPhotoUrl(url)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Short Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className={inputClass} placeholder="A bit about yourself..." />
          </div>
          {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50">
              {saving ? "Submitting..." : "Submit Request"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted hover:bg-surface transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
