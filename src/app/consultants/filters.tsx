"use client";

import { useState, useMemo } from "react";

type Consultant = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  specialty: string;
  priceRange: string;
  serviceArea: string;
  description?: string;
  imageUrl?: string;
  teamPhoto?: string;
  logo?: string;
  featured: boolean;
};

const SPECIALTIES = [
  "All",
  "Clinical Biomechanics",
  "Injury Prevention & Rehab",
  "Sports Science",
  "Performance Analytics",
  "Strength & Conditioning",
  "Mental Performance",
  "Nutrition & Recovery",
  "Tactical & Strategy",
  "Sports Psychology",
  "Video Analysis",
  "Goalkeeper Development",
  "Academy & Club Development",
  "General",
];

export function ConsultantFilters({ consultants }: { consultants: Consultant[] }) {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");

  const filtered = useMemo(() => {
    return consultants.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        c.state.toLowerCase().includes(search.toLowerCase()) ||
        c.serviceArea.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty = specialty === "All" || c.specialty === specialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [consultants, search, specialty]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, city, or state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All Specialties" : s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-lg font-semibold">No consultants found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const photo = c.imageUrl || c.teamPhoto || c.logo || "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";
            return (
              <a
                key={c.id}
                href={`/consultants/${c.slug}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative overflow-hidden h-[160px]">
                  <img src={photo} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {c.featured && (
                    <span className="absolute top-3 left-3 bg-[#DC373E] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-extrabold text-primary text-[15px] leading-tight uppercase tracking-tight truncate">{c.name}</h3>
                  <p className="text-xs text-accent font-semibold mt-0.5">{c.specialty}</p>
                  <p className="text-xs text-muted mt-1">{c.city}, {c.state}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted">{c.serviceArea}</span>
                    <span className="text-xs font-bold text-primary">{c.priceRange}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
