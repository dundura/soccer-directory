"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ImageUpload } from "@/components/image-upload";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export default function NewFundraiserPage() {
  const { status } = useSession();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [coachName, setCoachName] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [coachPhone, setCoachPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [clubId, setClubId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [listings, setListings] = useState<{ id: string; name: string; type: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/listings").then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setListings(data.filter((l: { type: string }) => l.type === "club" || l.type === "team"));
      }
    }).catch(() => {});
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60));
    }
  }, [title, slug]);

  if (status === "loading") return <div className="max-w-xl mx-auto px-6 py-20 text-center text-muted">Loading...</div>;
  if (status === "unauthenticated") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-2">Sign In Required</h1>
        <p className="text-muted mb-4">You need to sign in to create a fundraiser.</p>
        <a href="/api/auth/signin" className="inline-block px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-colors">Sign In</a>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    setSaving(true);

    try {
      const res = await fetch("/api/fundraiser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, slug, description, goal: goal ? Math.round(Number(goal) * 100) : undefined,
          coachName, coachEmail, coachPhone, websiteUrl, facebookUrl, instagramUrl,
          heroImageUrl, clubId: clubId || undefined, teamId: teamId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      window.location.href = `/fundraiser/${data.slug}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  const clubs = listings.filter(l => l.type === "club");
  const teams = listings.filter(l => l.type === "team");

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-6">Create a Fundraiser</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Fundraiser Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Help Our Team Travel to Nationals" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Custom URL Slug</label>
          <div className="flex items-center gap-1 text-sm text-muted mb-1">
            <span>soccer-near-me.com/fundraiser/</span>
            <span className="font-bold text-primary">{slug || "your-slug"}</span>
          </div>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className={inputClass} placeholder="your-custom-url" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={inputClass} placeholder="Tell supporters what this fundraiser is for..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fundraising Goal ($)</label>
          <input type="number" min="0" step="1" value={goal} onChange={(e) => setGoal(e.target.value)} className={inputClass} placeholder="e.g. 5000 (optional)" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hero Image</label>
          {heroImageUrl && <img src={heroImageUrl} alt="Hero" className="w-full h-32 object-cover rounded-lg mb-2" />}
          <ImageUpload onUploaded={(url) => setHeroImageUrl(url)} />
          {heroImageUrl && <input type="text" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} className={inputClass} placeholder="Or paste image URL" />}
        </div>

        <hr className="border-border" />
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Contact Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Contact Name</label>
            <input type="text" value={coachName} onChange={(e) => setCoachName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Email</label>
            <input type="email" value={coachEmail} onChange={(e) => setCoachEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Phone</label>
            <input type="tel" value={coachPhone} onChange={(e) => setCoachPhone(e.target.value)} className={inputClass} />
          </div>
        </div>

        <hr className="border-border" />
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Social Links</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Website URL</label>
            <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Facebook URL</label>
            <input type="url" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instagram URL</label>
            <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className={inputClass} />
          </div>
        </div>

        <hr className="border-border" />
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Link to Listing (Optional)</h2>
        <p className="text-sm text-muted -mt-3">Link this fundraiser to your club or team page to show a Donate button.</p>

        {clubs.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Link to Club</label>
            <select value={clubId} onChange={(e) => { setClubId(e.target.value); if (e.target.value) setTeamId(""); }} className={inputClass}>
              <option value="">None</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {teams.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Link to Team</label>
            <select value={teamId} onChange={(e) => { setTeamId(e.target.value); if (e.target.value) setClubId(""); }} className={inputClass}>
              <option value="">None</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        )}

        <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent-hover transition-colors disabled:opacity-50">
          {saving ? "Creating..." : "Create Fundraiser"}
        </button>
      </form>
    </div>
  );
}
