"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const TYPE_LABELS: Record<string, string> = {
  club: "Club", team: "Team", trainer: "Trainer", camp: "Camp",
  guest: "Guest Play Opportunity", tournament: "Tournament", futsal: "Futsal Team",
};

const TYPE_PATHS: Record<string, string> = {
  club: "clubs", team: "teams", trainer: "trainers", camp: "camps",
  guest: "guest-play", tournament: "tournaments", futsal: "futsal",
  player: "guest-play/players",
};

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export default function ContactPage() {
  const params = useParams();
  const type = params.type as string;
  const slug = params.slug as string;

  const [form, setForm] = useState({ senderName: "", senderEmail: "", message: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loadedAt] = useState(Date.now());

  const label = TYPE_LABELS[type] || type;
  const backPath = `/${TYPE_PATHS[type] || type}/${slug}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug, senderName: form.senderName, senderEmail: form.senderEmail, message: form.message, website: form.website, _t: loadedAt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <>
        <div className="bg-primary text-white py-12">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">Message Sent!</h1>
            <p className="text-white/60">Your inquiry has been delivered.</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-2xl border border-border p-8">
            <div className="text-5xl mb-4">&#9989;</div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">Thank you!</h2>
            <p className="text-muted mb-6">Your message has been sent to the {label.toLowerCase()} listing owner. They will respond directly to your email.</p>
            <a
              href={backPath}
              className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors"
            >
              Back to Listing
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-2xl mx-auto px-4">
          <a href={backPath} className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; Back to Listing</a>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">Send a Message</h1>
          <p className="text-white/60">Contact this {label.toLowerCase()} through Soccer Near Me</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name <span className="text-accent">*</span></label>
            <input
              type="text"
              required
              value={form.senderName}
              onChange={(e) => setForm((f) => ({ ...f, senderName: e.target.value }))}
              className={inputClass}
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Email <span className="text-accent">*</span></label>
            <input
              type="email"
              required
              value={form.senderEmail}
              onChange={(e) => setForm((f) => ({ ...f, senderEmail: e.target.value }))}
              className={inputClass}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message <span className="text-accent">*</span></label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className={inputClass + " resize-none"}
              placeholder="Hi, I'm interested in learning more about..."
            />
          </div>

          {/* Honeypot - hidden from real users */}
          <div className="absolute opacity-0 -z-10" aria-hidden="true">
            <label>Website</label>
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            />
          </div>

          {error && <p className="text-accent text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>

          <p className="text-xs text-muted text-center">
            Your message will be delivered to the listing owner and to our team. They will reply directly to your email.
          </p>
        </form>
      </div>
    </>
  );
}
