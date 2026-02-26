"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

const CATEGORIES = ["Looking for Players", "Looking for Team", "Tournament Guest Play", "Showcase Opportunity", "General"];

export default function NewGuestPostPage() {
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
            <p className="text-white/60">You need to be logged in to create a post</p>
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
      const res = await fetch("/api/guest-play/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      window.location.href = `/guest-play/posts/${json.slug}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-2xl mx-auto px-4">
          <a href="/guest-play/posts" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; Back to Posts</a>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">Create a Post</h1>
          <p className="text-white/60">Share a guest play opportunity or request with the community</p>
        </div>
      </div>

      <div className="bg-white min-h-[60vh]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Title <span className="text-accent">*</span></label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="What are you looking for or offering?" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category <span className="text-accent">*</span></label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass + " bg-white"}>
              <option value="">Select a category...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Details <span className="text-accent">*</span></label>
            <textarea required rows={8} value={body} onChange={(e) => setBody(e.target.value)} className={inputClass + " resize-none"} placeholder="Include details like position, age group, dates, location, level of play..." />
          </div>

          {error && <p className="text-accent text-sm">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
            {submitting ? "Creating..." : "Create Post"}
          </button>
        </form>
      </div>
      </div>
    </>
  );
}
