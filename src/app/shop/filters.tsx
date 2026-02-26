"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketplaceItem } from "@/lib/types";
import { ListingCard, FilterBar, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const affiliateSections = [
  {
    id: "essential-gear",
    icon: "\u26BD",
    title: "Essential Training Gear",
    description: "Everything your player needs to train at home and accelerate their development.",
    products: [
      { title: "Adidas MLS Training Soccer Ball", image: "https://anytime-soccer.com/wp-content/uploads/2026/01/adidas-mls-soccer-ball.jpg", href: "https://amzn.to/4q6yUY3" },
      { title: "Disc Training Cones (Set of 40)", image: "https://anytime-soccer.com/wp-content/uploads/2026/01/training-cones.jpg", href: "https://amzn.to/4soWKzv" },
      { title: "PUGG Pop-Up Soccer Goals (Set of 2)", image: "https://anytime-soccer.com/wp-content/uploads/2026/01/popup-goals.jpg", href: "https://amzn.to/4qA1Kj9" },
      { title: "Soccer Rebounder", image: "https://anytime-soccer.com/wp-content/uploads/2026/01/soccer-rebounder.jpg", href: "https://amzn.to/4qFkfD1" },
      { title: "Bluetooth Speaker", image: "https://anytime-soccer.com/wp-content/uploads/2026/01/blue_tooth_speaker.jpg", href: "https://amzn.to/4sGL2Rc" },
      { title: "Agility Ladder Set", image: "https://anytime-soccer.com/wp-content/uploads/2026/01/soccer_agility_ladder.jpg", href: "https://amzn.to/4spLHX1" },
      { title: "Size One Soccer Ball", image: "https://anytime-soccer.com/wp-content/uploads/2026/01/size_one-soccer-balls.jpg", href: "https://amzn.to/4aM3st9" },
      { title: "Portable Ball Pump", image: "https://anytime-soccer.com/wp-content/uploads/2026/01/portable_ball_pump.jpg", href: "https://amzn.to/3YZtSQU" },
    ],
  },
  {
    id: "rebounders",
    icon: "\uD83C\uDFAF",
    title: "Soccer Rebounders",
    description: "Smart and budget-friendly rebounders for wall passing and first touch training.",
    products: [
      { title: "A-Champs RebounderGo - Smart Training Rebounder with Lights & Sensors", image: "https://anytime-soccer.com/wp-content/uploads/2025/07/a-champs_rebounder.webp", href: "https://a-champs.com/collections/soccer-training-equipment?sca_ref=9165467.J8S7aW63u8&utm_source=uppromote&utm_medium=affiliate&utm_campaign=neil-crawford", price: "$269" },
      { title: "QuickPlay REPLAY Station - Most Portable Rebounder", image: "https://anytime-soccer.com/wp-content/uploads/2025/09/replay-station-xl-best-rebound-board-soccer_1482x1482.webp", href: "https://amzn.to/4mQFcsT", price: "$89-$179" },
      { title: "SteelRebound with HDPE Board - Best Budget Portable Rebounder", image: "https://anytime-soccer.com/wp-content/uploads/2025/09/s-l1600-1.webp", href: "https://amzn.to/4njgP73", price: "$119" },
      { title: "Portable Rebound Net - Simple & Affordable", image: "https://anytime-soccer.com/wp-content/uploads/2026/01/soccer-rebounder.jpg", href: "https://amzn.to/465vYSw" },
    ],
  },
];

export function ShopFilters({ items }: { items: MarketplaceItem[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(affiliateSections.map((s) => [s.id, true]))
  );

  const categories = [...new Set(items.map((i) => i.category))].sort();
  const states = [...new Set(items.map((i) => i.state))].sort();

  const filtered = items.filter((i) => {
    if (search) {
      const q = search.toLowerCase();
      if (!i.name.toLowerCase().includes(q) && !i.city.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) return false;
    }
    if (category && i.category !== category) return false;
    if (state && i.state !== state) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  function toggle(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Recommendations
          </h1>
          <p className="text-white/70 max-w-2xl text-lg">
            Recommended gear and equipment from the soccer community.
          </p>
        </div>
      </div>

      {/* Recommended Gear Sections */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {affiliateSections.map((section) => {
            const isOpen = openSections[section.id];
            return (
              <div key={section.id} className="mb-4">
                <button
                  onClick={() => toggle(section.id)}
                  className="w-full flex items-center justify-between py-6 border-b-2 border-border text-left"
                >
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-xl md:text-2xl font-bold flex items-center gap-3">
                      <span className="text-2xl">{section.icon}</span>
                      {section.title}
                    </h2>
                    <p className="text-muted text-sm mt-1">{section.description}</p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-accent shrink-0 ml-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-8 pb-4">
                    {section.products.map((product) => (
                      <div key={product.title} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                        <img src={product.image} alt={product.title} className="w-full aspect-square object-contain p-4 border-b border-border bg-white" />
                        <div className="p-4 flex flex-col flex-1">
                          <p className="text-sm font-semibold mb-3 flex-1 leading-snug">{product.title}</p>
                          <a href={product.href} target="_blank" rel="noopener" className="block w-full py-2.5 rounded-xl bg-accent text-white text-center font-semibold hover:bg-accent-hover transition-colors text-sm">
                            {product.price ? `Buy Now - ${product.price}` : "Buy Now"}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Affiliate Disclosure */}
          <p className="text-center text-xs text-muted mt-4 mb-8">
            <strong>Disclosure:</strong> As an Amazon Associate and affiliate partner, we earn from qualifying purchases at no extra cost to you.
          </p>
        </div>
      </div>

      {/* Community Listings */}
      {items.length > 0 && (
        <div className="bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="font-[family-name:var(--font-display)] text-xl md:text-2xl font-bold mb-2">Community Marketplace</h2>
            <p className="text-muted mb-6">Equipment listed by the soccer community.</p>

            {/* Search + Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by item name or description..."
                className="flex-1 px-5 py-4 rounded-xl text-primary text-base placeholder:text-muted focus:outline-none"
              />
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="px-4 py-4 rounded-xl border border-border text-sm font-medium text-primary bg-surface focus:outline-none cursor-pointer sm:w-48"
              >
                <option value="">All States</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <FilterBar
              filters={[
                { label: "All Categories", options: categories, value: category, onChange: setCategory },
              ]}
            />
            {sorted.length === 0 ? (
              <EmptyState message="No items match your filters." />
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sorted.map((item) => (
                    <ListingCard
                      key={item.id}
                      href={`/shop/${item.slug}`}
                      title={item.name}
                      subtitle={`${item.city}, ${item.state}`}
                      badges={[
                        { label: item.category, variant: "green" },
                        { label: item.condition },
                      ]}
                      details={[{ label: "Price", value: item.price }]}
                      featured={item.featured}
                      cta="View Item"
                    />
                  ))}
                </div>
                <div className="mt-8"><AnytimeInlineCTA /></div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
