"use client";

import { useState } from "react";
import type { ListingType } from "@/lib/types";

const FIELDS: Record<ListingType, { name: string; label: string; required?: boolean; type?: string; options?: string[] }[]> = {
  club: [
    { name: "name", label: "Club Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "ECNL", "MLS Next", "GA", "Pre-ECNL", "Other"] },
    { name: "ageGroups", label: "Age Groups (e.g. U8-U18)", required: true },
    { name: "gender", label: "Gender", required: true, options: ["Boys & Girls", "Boys", "Girls"] },
    { name: "teamCount", label: "Number of Teams", type: "number" },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "website", label: "Website" },
    { name: "email", label: "Contact Email", type: "email" },
  ],
  team: [
    { name: "name", label: "Team Name", required: true },
    { name: "clubName", label: "Club Name" },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "ECNL", "MLS Next", "GA", "Pre-ECNL", "Other"] },
    { name: "ageGroup", label: "Birth Year (e.g. 2012)", required: true },
    { name: "gender", label: "Gender", required: true, options: ["Boys", "Girls", "Coed"] },
    { name: "coach", label: "Head Coach", required: true },
    { name: "lookingForPlayers", label: "Looking for Players?", options: ["true", "false"] },
    { name: "positionsNeeded", label: "Positions Needed" },
    { name: "season", label: "Season", required: true, options: ["2025-2026", "2026-2027", "Year-Round"] },
    { name: "description", label: "Description", type: "textarea" },
  ],
  trainer: [
    { name: "name", label: "Your Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true },
    { name: "specialty", label: "Specialty", required: true, options: ["Shooting & Finishing", "Technical Skills", "Goalkeeping", "Speed & Agility", "Tactical Development", "Position-Specific", "General"] },
    { name: "experience", label: "Experience (e.g. 10+ years)", required: true },
    { name: "credentials", label: "Credentials / Licenses", required: true },
    { name: "priceRange", label: "Price Range (e.g. $60-80/session)", required: true },
    { name: "serviceArea", label: "Service Area", required: true },
    { name: "description", label: "Description", type: "textarea" },
  ],
  camp: [
    { name: "name", label: "Camp Name", required: true },
    { name: "organizerName", label: "Organizer Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true },
    { name: "campType", label: "Camp Type", required: true, options: ["Elite ID Camp", "Recreational Camp", "Position-Specific Clinic", "College Showcase", "Specialty Clinic", "Day Camp"] },
    { name: "ageRange", label: "Age Range (e.g. U10-U14)", required: true },
    { name: "dates", label: "Dates (e.g. June 15-18, 2026)", required: true },
    { name: "price", label: "Price (e.g. $299)", required: true },
    { name: "gender", label: "Gender", required: true, options: ["Boys & Girls", "Boys", "Girls"] },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "registrationUrl", label: "Registration URL" },
    { name: "email", label: "Contact Email", type: "email" },
  ],
  guest: [
    { name: "teamName", label: "Team Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "ECNL", "MLS Next", "GA", "Pre-ECNL", "Other"] },
    { name: "ageGroup", label: "Age Group (e.g. U14)", required: true },
    { name: "gender", label: "Gender", required: true, options: ["Boys", "Girls", "Coed"] },
    { name: "dates", label: "Dates", required: true },
    { name: "tournament", label: "Tournament Name", required: true },
    { name: "positionsNeeded", label: "Positions Needed", required: true },
    { name: "contactEmail", label: "Contact Email", required: true, type: "email" },
    { name: "description", label: "Description", type: "textarea" },
  ],
  tournament: [
    { name: "name", label: "Tournament Name", required: true },
    { name: "organizer", label: "Organizer", required: true },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true },
    { name: "dates", label: "Dates (e.g. March 15-17, 2026)", required: true },
    { name: "ageGroups", label: "Age Groups (e.g. U10-U18)", required: true },
    { name: "gender", label: "Gender", required: true, options: ["Boys & Girls", "Boys", "Girls"] },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "ECNL", "MLS Next", "Open", "Other"] },
    { name: "entryFee", label: "Entry Fee (e.g. $750/team)", required: true },
    { name: "format", label: "Format", required: true, options: ["7v7", "9v9", "11v11", "Mixed"] },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "registrationUrl", label: "Registration URL" },
    { name: "email", label: "Contact Email", type: "email" },
  ],
};

const TYPE_LABELS: Record<ListingType, string> = {
  club: "Club",
  team: "Team",
  trainer: "Trainer",
  camp: "Camp",
  guest: "Guest Play Opportunity",
  tournament: "Tournament",
};

export function ListingForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [type, setType] = useState<ListingType>("club");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fields = FIELDS[type];

  function handleChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: formData }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Listing type selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Listing Type</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(TYPE_LABELS) as ListingType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setFormData({}); }}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                type === t
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border text-muted hover:border-primary/30"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic fields */}
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">
            {field.label} {field.required && <span className="text-accent">*</span>}
          </label>
          {field.options ? (
            <select
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
            >
              <option value="">Select...</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>{opt === "true" ? "Yes" : opt === "false" ? "No" : opt}</option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
            />
          ) : (
            <input
              type={field.type || "text"}
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          )}
        </div>
      ))}

      {error && <p className="text-accent text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {submitting ? "Creating..." : `Create ${TYPE_LABELS[type]}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border border-border font-semibold text-muted hover:bg-surface transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
