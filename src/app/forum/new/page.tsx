"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

const CATEGORIES = ["Questions", "Club Feedback", "League Feedback", "Training", "College Recruiting", "Recommendation", "General"];

export default function NewTopicPage() {
  const { status } = useSession();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted">Loading...</div>
    );
  }

  if (status !== "authenticated") {
    return (
      <>
        <div className="bg-primary text-white py-12">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">Sign In Required</h1>
            <p className="text-white/60">You need to be logged in to start a discussion</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <a href="/dashboard" className="px-8 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors inline-block">
            Log In / Sign Up
          </a>
        </div>
      </>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      window.location.href = `/forum/${json.slug}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create topic");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-2xl mx-auto px-4">
          <a href="/forum" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; Back to Forum</a>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">Start a Discussion</h1>
          <p className="text-white/60">Share a topic with the youth soccer community</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Title <span className="text-accent">*</span></label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="What do you want to discuss?" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category <span className="text-accent">*</span></label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass + " bg-white"}>
              <option value="">Select a category...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Body <span className="text-accent">*</span></label>
            <textarea required rows={8} value={body} onChange={(e) => setBody(e.target.value)} className={inputClass + " resize-none"} placeholder="Share your thoughts..." />
          </div>

          {error && <p className="text-accent text-sm">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
            {submitting ? "Creating..." : "Create Discussion"}
          </button>
        </form>
      </div>
    </>
  );
}
