"use client";

import { useState } from "react";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export function ContactPlayerForm({ playerName, slug }: { playerName: string; slug: string }) {
  const [form, setForm] = useState({ name: "", email: "", team: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/guest-play/players/${slug}/contact`, {
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
        <p className="text-muted text-sm">Your message has been sent to {playerName}. They will contact you directly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Your Name <span className="text-accent">*</span></label>
        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Coach John Smith" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Your Email <span className="text-accent">*</span></label>
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="coach@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Team / Club Name</label>
        <input type="text" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className={inputClass} placeholder="FC United ECNL U14" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Message <span className="text-accent">*</span></label>
        <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass + " resize-none"} placeholder="Tell the player about the opportunity..." />
      </div>
      {error && <p className="text-accent text-sm">{error}</p>}
      <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
