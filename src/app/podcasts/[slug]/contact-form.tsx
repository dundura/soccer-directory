"use client";

import { useState } from "react";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export function ContactPodcastForm({ podcastName, slug }: { podcastName: string; slug: string }) {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/podcasts/${slug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to send message");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="text-3xl mb-3">&#9989;</div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mb-1">Message Sent!</h3>
        <p className="text-muted text-sm">Your message has been sent to {podcastName}. They will contact you directly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Your Name <span className="text-accent">*</span></label>
        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="John Smith" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Your Email <span className="text-accent">*</span></label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="john@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Topic / Expertise</label>
        <input type="text" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={inputClass} placeholder="e.g. Youth coaching, college recruiting..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Message <span className="text-accent">*</span></label>
        <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass + " resize-none"} placeholder="Tell the host why you'd be a great guest..." />
      </div>
      {error && <p className="text-accent text-sm">{error}</p>}
      <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
        {submitting ? "Sending..." : "Send Guest Request"}
      </button>
    </form>
  );
}
