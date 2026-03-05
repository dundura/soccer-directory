"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { ImageUpload } from "@/components/image-upload";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export default function EditFundraiserPage() {
  const { status } = useSession();
  const { slug } = useParams<{ slug: string }>();
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [coachName, setCoachName] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [coachPhone, setCoachPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [active, setActive] = useState(true);
  const [clubId, setClubId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/fundraiser/${slug}`).then(r => r.json()).then(data => {
      if (data.fundraiser) {
        const f = data.fundraiser;
        setTitle(f.title || "");
        setDescription(f.description || "");
        setGoal(f.goal ? String(f.goal / 100) : "");
        setCoachName(f.coachName || "");
        setCoachEmail(f.coachEmail || "");
        setCoachPhone(f.coachPhone || "");
        setWebsiteUrl(f.websiteUrl || "");
        setFacebookUrl(f.facebookUrl || "");
        setInstagramUrl(f.instagramUrl || "");
        setHeroImageUrl(f.heroImageUrl || "");
        setActive(f.active);
        setClubId(f.clubId || "");
        setTeamId(f.teamId || "");
        setLoaded(true);
      }
    }).catch(() => {});
  }, [slug]);

  if (status === "loading" || !loaded) return <div className="max-w-xl mx-auto px-6 py-20 text-center text-muted">Loading...</div>;
  if (status === "unauthenticated") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-2">Sign In Required</h1>
        <a href="/api/auth/signin" className="inline-block px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-colors">Sign In</a>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false);
    if (!title.trim()) { setError("Title is required"); return; }
    setSaving(true);

    try {
      const res = await fetch(`/api/fundraiser/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, goal: goal ? String(Math.round(Number(goal) * 100)) : "",
          coachName, coachEmail, coachPhone, websiteUrl, facebookUrl, instagramUrl,
          heroImageUrl, active: String(active), clubId, teamId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary">Edit Fundraiser</h1>
        <a href={`/fundraiser/${slug}`} className="text-sm text-accent hover:text-accent-hover">View Page &rarr;</a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Goal ($)</label>
          <input type="number" min="0" step="1" value={goal} onChange={(e) => setGoal(e.target.value)} className={inputClass} placeholder="Optional" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hero Image</label>
          {heroImageUrl && <img src={heroImageUrl} alt="Hero" className="w-full h-32 object-cover rounded-lg mb-2" />}
          <ImageUpload onUploaded={(url) => setHeroImageUrl(url)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select value={active ? "true" : "false"} onChange={(e) => setActive(e.target.value === "true")} className={inputClass}>
            <option value="true">Active — Accepting Donations</option>
            <option value="false">Closed — No Longer Accepting</option>
          </select>
        </div>

        <hr className="border-border" />
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={coachName} onChange={(e) => setCoachName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={coachEmail} onChange={(e) => setCoachEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" value={coachPhone} onChange={(e) => setCoachPhone(e.target.value)} className={inputClass} />
          </div>
        </div>

        <hr className="border-border" />
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Social Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Facebook</label>
            <input type="url" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instagram</label>
            <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className={inputClass} />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
        {success && <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-3">Fundraiser updated!</p>}

        <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent-hover transition-colors disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
