"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  { label: "Everything", value: "" },
  { label: "Clubs", value: "clubs" },
  { label: "Teams", value: "teams" },
  { label: "Trainers", value: "trainers" },
  { label: "Camps", value: "camps" },
  { label: "Guest Play", value: "guest-play" },
  { label: "Futsal", value: "futsal" },
  { label: "Tournaments", value: "tournaments" },
];

export function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    // No category picked → search every listing type, not just clubs
    if (!category) {
      router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
      return;
    }
    router.push(`/${category}${q ? `?search=${encodeURIComponent(q)}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 mb-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, city, or state..."
        className="flex-1 px-5 py-4 rounded-xl text-primary text-base placeholder:text-muted focus:outline-none"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="px-4 py-4 rounded-xl border border-border text-sm font-medium text-primary bg-surface focus:outline-none cursor-pointer sm:w-48"
      >
        {categories.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <button
        type="submit"
        className="px-8 py-4 rounded-xl bg-accent text-white font-semibold text-base hover:bg-accent-hover transition-colors whitespace-nowrap"
      >
        Search
      </button>
    </form>
  );
}
