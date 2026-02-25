"use client";

import { useState } from "react";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

const POSITIONS = [
  "Goalkeeper", "Center Back", "Right Back", "Left Back",
  "Defensive Midfielder", "Central Midfielder", "Attacking Midfielder",
  "Right Wing", "Left Wing", "Striker", "Forward", "Any Position",
];

interface Props {
  teamName: string;
  tournament: string;
  slug: string;
}

export function RequestSpotForm({ teamName, tournament, slug }: Props) {
  const [form, setForm] = useState({
    parentName: "",
    playerName: "",
    position: "",
    email: "",
    phone: "",
    videoLink: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/guest-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, teamName, tournament, ...form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">&#9989;</div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mb-2">Request Sent!</h3>
        <p className="text-muted text-sm">Your guest player request has been sent to {teamName}. They will contact you at {form.email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Parent / Guardian Name <span className="text-accent">*</span></label>
          <input
            type="text"
            required
            value={form.parentName}
            onChange={(e) => update("parentName", e.target.value)}
            className={inputClass}
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Player Name <span className="text-accent">*</span></label>
          <input
            type="text"
            required
            value={form.playerName}
            onChange={(e) => update("playerName", e.target.value)}
            className={inputClass}
            placeholder="Alex Smith"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Position <span className="text-accent">*</span></label>
          <select
            required
            value={form.position}
            onChange={(e) => update("position", e.target.value)}
            className={inputClass + " bg-white"}
          >
            <option value="">Select position...</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email <span className="text-accent">*</span></label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
            placeholder="parent@email.com"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Video / Highlight Link</label>
          <input
            type="url"
            value={form.videoLink}
            onChange={(e) => update("videoLink", e.target.value)}
            className={inputClass}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Additional Message</label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className={inputClass + " resize-none"}
          placeholder="Tell the team about the player's experience, current club, etc."
        />
      </div>

      {error && <p className="text-accent text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Submit Request"}
      </button>

      <p className="text-xs text-muted text-center">
        Your information will be sent to the team and our admin. The team will reply directly to your email.
      </p>
    </form>
  );
}
