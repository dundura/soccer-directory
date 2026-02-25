"use client";

import { useState } from "react";
import type { ListingType } from "@/lib/types";

// ── Constants ──────────────────────────────────────────────────

const DEFAULT_IMAGE = "https://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming", "Washington D.C.", "International",
];

const COUNTRIES = [
  "United States", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
  "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China",
  "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
  "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran",
  "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "Korea North", "Korea South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const AGE_GROUPS = ["All", "U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19"];

const DEFAULT_DESCRIPTIONS: Record<ListingType, string> = {
  club: "We are a youth soccer club committed to developing players of all levels. Our experienced coaching staff focuses on technical skills, tactical awareness, and a love for the game.",
  team: "Our team competes at a competitive level and we're looking for dedicated players who want to improve and compete. Join us for a great season!",
  trainer: "I am a certified soccer trainer with years of experience developing players of all ages. My sessions focus on technical skills, game IQ, and building confidence on the ball.",
  camp: "Join us for an exciting soccer camp experience! Players will enjoy skill-building sessions, small-sided games, and a fun environment designed to help every player improve.",
  guest: "We're looking for guest players to join our team for an upcoming tournament. This is a great opportunity to compete at a high level and showcase your skills.",
  tournament: "Join teams from across the region for this exciting tournament. Competitive divisions, professional fields, and great competition for all age groups.",
  futsal: "Our futsal team competes in a fast-paced indoor environment that develops quick thinking, close control, and sharp passing. All skill levels welcome.",
};

// ── Field definitions ──────────────────────────────────────────

type FieldDef = {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  options?: string[];
};

const FIELDS: Record<ListingType, FieldDef[]> = {
  club: [
    { name: "name", label: "Club Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "ECNL", "MLS Next", "GA", "Pre-ECNL", "Other"] },
    { name: "ageGroups", label: "Age Groups", required: true, type: "age-multi" },
    { name: "gender", label: "Gender", required: true, options: ["Boys & Girls", "Boys", "Girls"] },
    { name: "teamCount", label: "Number of Teams", type: "number" },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "website", label: "Website" },
    { name: "email", label: "Contact Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_images", label: "Images", type: "heading" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Feature Image", type: "image" },
  ],
  team: [
    { name: "name", label: "Team Name", required: true },
    { name: "clubName", label: "Club Name" },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "ECNL", "MLS Next", "GA", "Pre-ECNL", "Other"] },
    { name: "ageGroup", label: "Age Group", required: true, type: "age-select" },
    { name: "gender", label: "Gender", required: true, options: ["Boys", "Girls", "Coed"] },
    { name: "coach", label: "Head Coach", required: true },
    { name: "lookingForPlayers", label: "Looking for Players?", options: ["true", "false"] },
    { name: "positionsNeeded", label: "Positions Needed" },
    { name: "season", label: "Season", required: true, options: ["2025-2026", "2026-2027", "Year-Round"] },
    { name: "description", label: "Description", type: "textarea" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_images", label: "Images", type: "heading" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Feature Image", type: "image" },
  ],
  trainer: [
    { name: "name", label: "Your Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "specialty", label: "Specialty", required: true, options: ["Shooting & Finishing", "Technical Skills", "Goalkeeping", "Speed & Agility", "Tactical Development", "Position-Specific", "General"] },
    { name: "experience", label: "Experience (e.g. 10+ years)", required: true },
    { name: "credentials", label: "Credentials / Licenses", required: true },
    { name: "priceRange", label: "Price Range (e.g. $60-80/session)", required: true },
    { name: "serviceArea", label: "Service Area", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "website", label: "Website" },
    { name: "email", label: "Contact Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_images", label: "Images", type: "heading" },
    { name: "logo", label: "Logo / Headshot URL" },
    { name: "imageUrl", label: "Feature Image", type: "image" },
  ],
  camp: [
    { name: "name", label: "Camp Name", required: true },
    { name: "organizerName", label: "Organizer Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "campType", label: "Camp Type", required: true, options: ["Elite ID Camp", "Recreational Camp", "Position-Specific Clinic", "College Showcase", "Specialty Clinic", "Day Camp"] },
    { name: "ageRange", label: "Age Range", required: true, type: "age-multi" },
    { name: "dates", label: "Dates (e.g. June 15-18, 2026)", required: true },
    { name: "price", label: "Price (e.g. $299)", required: true },
    { name: "gender", label: "Gender", required: true, options: ["Boys & Girls", "Boys", "Girls"] },
    { name: "location", label: "Location / Venue" },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "registrationUrl", label: "Registration URL" },
    { name: "email", label: "Contact Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_images", label: "Images", type: "heading" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Feature Image", type: "image" },
  ],
  guest: [
    { name: "teamName", label: "Team Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "ECNL", "MLS Next", "GA", "Pre-ECNL", "Other"] },
    { name: "ageGroup", label: "Age Group", required: true, type: "age-select" },
    { name: "gender", label: "Gender", required: true, options: ["Boys", "Girls", "Coed"] },
    { name: "dates", label: "Dates", required: true },
    { name: "tournament", label: "Tournament Name", required: true },
    { name: "positionsNeeded", label: "Positions Needed", required: true },
    { name: "contactEmail", label: "Contact Email", required: true, type: "email" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_images", label: "Images", type: "heading" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Feature Image", type: "image" },
  ],
  tournament: [
    { name: "name", label: "Tournament Name", required: true },
    { name: "organizer", label: "Organizer", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "dates", label: "Dates (e.g. March 15-17, 2026)", required: true },
    { name: "ageGroups", label: "Age Groups", required: true, type: "age-multi" },
    { name: "gender", label: "Gender", required: true, options: ["Boys & Girls", "Boys", "Girls"] },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "ECNL", "MLS Next", "Open", "Other"] },
    { name: "entryFee", label: "Entry Fee (e.g. $750/team)", required: true },
    { name: "format", label: "Format", required: true, options: ["7v7", "9v9", "11v11", "Mixed"] },
    { name: "region", label: "Region", required: true, options: ["US", "International"] },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "registrationUrl", label: "Registration URL" },
    { name: "email", label: "Contact Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_images", label: "Images", type: "heading" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Feature Image", type: "image" },
  ],
  futsal: [
    { name: "name", label: "Team Name", required: true },
    { name: "clubName", label: "Club Name" },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "Premier", "Semi-Pro", "Other"] },
    { name: "ageGroup", label: "Age Group", required: true, type: "age-select" },
    { name: "gender", label: "Gender", required: true, options: ["Boys", "Girls", "Coed", "Men", "Women"] },
    { name: "coach", label: "Head Coach", required: true },
    { name: "lookingForPlayers", label: "Looking for Players?", options: ["true", "false"] },
    { name: "positionsNeeded", label: "Positions Needed" },
    { name: "season", label: "Season", required: true, options: ["2025-2026", "2026-2027", "Year-Round"] },
    { name: "format", label: "Format", required: true, options: ["5v5", "6v6", "4v4"] },
    { name: "description", label: "Description", type: "textarea" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_images", label: "Images", type: "heading" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Feature Image", type: "image" },
  ],
};

const TYPE_LABELS: Record<ListingType, string> = {
  club: "Club",
  team: "Team",
  trainer: "Trainer",
  camp: "Camp",
  guest: "Guest Play Opportunity",
  tournament: "Tournament",
  futsal: "Futsal Team",
};

// ── Shared styles ──────────────────────────────────────────────

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";
const selectClass = inputClass + " bg-white";

// ── Component ──────────────────────────────────────────────────

interface ListingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  mode?: "create" | "edit";
  editType?: ListingType;
  editId?: string;
  initialData?: Record<string, string>;
}

export function ListingForm({ onSuccess, onCancel, mode = "create", editType, editId, initialData }: ListingFormProps) {
  const isEdit = mode === "edit";
  const [type, setType] = useState<ListingType>(editType || "club");
  const [formData, setFormData] = useState<Record<string, string>>(
    initialData || { description: DEFAULT_DESCRIPTIONS["club"], imageUrl: DEFAULT_IMAGE, country: "United States" }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fields = FIELDS[type];

  function handleChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleTypeSwitch(t: ListingType) {
    setType(t);
    setFormData({ description: DEFAULT_DESCRIPTIONS[t], imageUrl: DEFAULT_IMAGE, country: "United States" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = "/api/listings";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit
        ? JSON.stringify({ type, id: editId, data: formData })
        : JSON.stringify({ type, data: formData });

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Listing type selector (hidden in edit mode) */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium mb-2">Listing Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TYPE_LABELS) as ListingType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeSwitch(t)}
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
      )}

      {/* Dynamic fields */}
      {fields.map((field) => {
        // Section heading
        if (field.type === "heading") {
          return (
            <div key={field.name} className="pt-2 pb-1 border-b border-border">
              <h3 className="text-sm font-bold text-primary">{field.label}</h3>
            </div>
          );
        }

        return (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-accent">*</span>}
            </label>

            {/* Select with options */}
            {field.options ? (
              <select
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className={selectClass}
              >
                <option value="">Select...</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt === "true" ? "Yes" : opt === "false" ? "No" : opt}</option>
                ))}
              </select>

            /* Country with searchable datalist */
            ) : field.type === "country" ? (
              <>
                <input
                  list="countries-list"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  placeholder="Start typing a country..."
                  className={inputClass}
                />
                <datalist id="countries-list">
                  {COUNTRIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </>

            /* State dropdown */
            ) : field.type === "state-select" ? (
              <select
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className={selectClass}
              >
                <option value="">Select state...</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

            /* Single age select */
            ) : field.type === "age-select" ? (
              <select
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className={selectClass}
              >
                <option value="">Select age group...</option>
                {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>

            /* Age range (min–max) */
            ) : field.type === "age-multi" ? (
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={(formData[field.name] || "").split("–")[0] || ""}
                  onChange={(e) => {
                    const max = (formData[field.name] || "").split("–")[1] || "";
                    handleChange(field.name, max ? `${e.target.value}–${max}` : e.target.value);
                  }}
                  required={field.required}
                  className={selectClass}
                >
                  <option value="">From...</option>
                  {AGE_GROUPS.filter((a) => a !== "All").map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <select
                  value={(formData[field.name] || "").split("–")[1] || ""}
                  onChange={(e) => {
                    const min = (formData[field.name] || "").split("–")[0] || "";
                    handleChange(field.name, min ? `${min}–${e.target.value}` : e.target.value);
                  }}
                  required={field.required}
                  className={selectClass}
                >
                  <option value="">To...</option>
                  {AGE_GROUPS.filter((a) => a !== "All").map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

            /* Feature image with default + reset */
            ) : field.type === "image" ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder="Image URL"
                  className={inputClass}
                />
                <div className="flex items-center gap-2">
                  {formData[field.name] && formData[field.name] !== DEFAULT_IMAGE && (
                    <button
                      type="button"
                      onClick={() => handleChange(field.name, DEFAULT_IMAGE)}
                      className="text-xs text-accent hover:underline"
                    >
                      Reset to Default
                    </button>
                  )}
                  {!formData[field.name] && (
                    <button
                      type="button"
                      onClick={() => handleChange(field.name, DEFAULT_IMAGE)}
                      className="text-xs text-accent hover:underline"
                    >
                      Use Default Image
                    </button>
                  )}
                </div>
                {formData[field.name] && (
                  <img
                    src={formData[field.name]}
                    alt="Preview"
                    className="rounded-lg max-h-40 object-cover border border-border"
                  />
                )}
              </div>

            /* Textarea */
            ) : field.type === "textarea" ? (
              <textarea
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                rows={4}
                className={inputClass + " resize-none"}
              />

            /* Logo URL with preview */
            ) : field.name === "logo" ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className={inputClass}
                />
                {formData[field.name] && (
                  <img
                    src={formData[field.name]}
                    alt="Logo preview"
                    className="h-16 w-16 rounded-lg object-contain border border-border"
                  />
                )}
              </div>

            /* Default text/email/number input */
            ) : (
              <input
                type={field.type || "text"}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className={inputClass}
              />
            )}
          </div>
        );
      })}

      {error && <p className="text-accent text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving..." : isEdit ? "Save Changes" : `Create ${TYPE_LABELS[type]}`}
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
