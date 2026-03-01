"use client";

import { useState } from "react";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export function ContactTryoutForm({ tryoutName, slug }: { tryoutName: string; slug: string }) {
  const [form, setForm] = useState({ senderName: "", senderEmail: "", message: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loadedAt] = useState(Date.now());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.website) return;
    if (Date.now() - loadedAt < 3000) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "tryout", slug, ...form }),
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
        <p className="text-muted text-sm">Your message has been sent to the organizer of {tryoutName}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Your Name <span className="text-accent">*</span></label>
        <input type="text" required value={form.senderName} onChange={(e) => setForm({ ...form, senderName: e.target.value })} className={inputClass} placeholder="John Smith" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Your Email <span className="text-accent">*</span></label>
        <input type="email" required value={form.senderEmail} onChange={(e) => setForm({ ...form, senderEmail: e.target.value })} className={inputClass} placeholder="john@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Message <span className="text-accent">*</span></label>
        <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass + " resize-none"} placeholder="Ask about tryout details, registration, etc..." />
      </div>
      <div className="hidden">
        <input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} tabIndex={-1} autoComplete="off" />
      </div>
      {error && <p className="text-accent text-sm">{error}</p>}
      <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
