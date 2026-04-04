"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketplaceItem } from "@/lib/types";
import { ListingCard, EmptyState, AnytimeInlineCTA } from "@/components/ui";

const affiliateSections = [
  {
    id: "essential-gear",
    icon: "\u26BD",
    title: "Essential Training Gear",
    description: "Everything your player needs to train at home and accelerate their development.",
    products: [
      { title: "Adidas MLS Training Soccer Ball", image: "https://media.anytime-soccer.com/wp-content/uploads/2026/01/adidas-mls-soccer-ball.jpg", href: "https://amzn.to/4q6yUY3" },
      { title: "Disc Training Cones (Set of 40)", image: "https://media.anytime-soccer.com/wp-content/uploads/2026/01/training-cones.jpg", href: "https://amzn.to/4soWKzv" },
      { title: "PUGG Pop-Up Soccer Goals (Set of 2)", image: "https://media.anytime-soccer.com/wp-content/uploads/2026/01/popup-goals.jpg", href: "https://amzn.to/4qA1Kj9" },
      { title: "Soccer Rebounder", image: "https://media.anytime-soccer.com/wp-content/uploads/2026/01/soccer-rebounder.jpg", href: "https://amzn.to/4qFkfD1" },
      { title: "Bluetooth Speaker", image: "https://media.anytime-soccer.com/wp-content/uploads/2026/01/blue_tooth_speaker.jpg", href: "https://amzn.to/4sGL2Rc" },
      { title: "Agility Ladder Set", image: "https://media.anytime-soccer.com/wp-content/uploads/2026/01/soccer_agility_ladder.jpg", href: "https://amzn.to/4spLHX1" },
      { title: "Size One Soccer Ball", image: "https://media.anytime-soccer.com/wp-content/uploads/2026/01/size_one-soccer-balls.jpg", href: "https://amzn.to/4aM3st9" },
      { title: "Portable Ball Pump", image: "https://media.anytime-soccer.com/wp-content/uploads/2026/01/portable_ball_pump.jpg", href: "https://amzn.to/3YZtSQU" },
    ],
  },
  {
    id: "rebounders",
    icon: "\uD83C\uDFAF",
    title: "Soccer Rebounders",
    description: "Smart and budget-friendly rebounders for wall passing and first touch training.",
    products: [
      { title: "A-Champs RebounderGo - Smart Training Rebounder with Lights & Sensors", image: "https://media.anytime-soccer.com/wp-content/uploads/2025/07/a-champs_rebounder.webp", href: "https://a-champs.com/collections/soccer-training-equipment?sca_ref=9165467.J8S7aW63u8&utm_source=uppromote&utm_medium=affiliate&utm_campaign=neil-crawford", price: "$269" },
      { title: "QuickPlay REPLAY Station - Most Portable Rebounder", image: "https://media.anytime-soccer.com/wp-content/uploads/2025/09/replay-station-xl-best-rebound-board-soccer_1482x1482.webp", href: "https://amzn.to/4mQFcsT", price: "$89-$179" },
      { title: "SteelRebound with HDPE Board - Best Budget Portable Rebounder", image: "https://media.anytime-soccer.com/wp-content/uploads/2025/09/s-l1600-1.webp", href: "https://amzn.to/4njgP73", price: "$119" },
      { title: "Portable Rebound Net - Simple & Affordable", image: "https://media.anytime-soccer.com/wp-content/uploads/2026/01/soccer-rebounder.jpg", href: "https://amzn.to/465vYSw" },
    ],
  },
];

const PER_PAGE = 10;

export function ShopFilters({ items }: { items: MarketplaceItem[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [condition, setCondition] = useState("");
  const [page, setPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(affiliateSections.map((s) => [s.id, true]))
  );

  const categories = [...new Set(items.map((i) => i.category))].sort();
  const states = [...new Set(items.map((i) => i.state))].sort();
  const conditions = [...new Set(items.map((i) => i.condition))].sort();

  const filtered = items.filter((i) => {
    if (search) {
      const q = search.toLowerCase();
      if (!i.name.toLowerCase().includes(q) && !i.city.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) return false;
    }
    if (category && i.category !== category) return false;
    if (state && i.state !== state) return false;
    if (condition && i.condition !== condition) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const allFeatured = sorted.filter((i) => i.featured);
  const [topCards] = useState(() => {
    if (allFeatured.length > 0) {
      const shuffled = [...allFeatured];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, 3);
    }
    return sorted.slice(0, 3);
  });
  const topCardIds = new Set(topCards.map((i) => i.id));
  const nonFeaturedItems = sorted.filter((i) => !topCardIds.has(i.id));
  const totalPages = Math.ceil(nonFeaturedItems.length / PER_PAGE);
  const visibleNonFeatured = viewAll ? nonFeaturedItems : nonFeaturedItems.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggle(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const hasActiveFilters = !!(search || category || state || condition || openSections);

  return (
    <>
      {/* ====== HERO SECTION ====== */}
      <div className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#1a4a7a] opacity-90" />
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: "60px" }}>
          <path fill="var(--background, #f8fafc)" d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" />
        </svg>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl lg:text-[56px] font-extrabold text-white uppercase tracking-tight leading-tight mb-4">
            Soccer Marketplace
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-10">
            Buy and sell soccer gear and equipment.
          </p>

          {/* Single unified search bar */}
          <div className="bg-white rounded-2xl lg:rounded-full shadow-2xl p-2 max-w-3xl mx-auto">
            <div className="flex flex-col lg:flex-row items-stretch">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name..."
                className="px-5 py-3 sm:rounded-l-full text-sm text-primary placeholder:text-muted focus:outline-none min-w-0 flex-1 sm:border-r border-border"
              />
              <select
                value={state}
                onChange={(e) => { setState(e.target.value); setPage(1); }}
                className="px-4 py-3 lg:rounded-l-full text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer lg:border-r border-border min-w-0"
              >
                <option value="">All States</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="px-4 py-3 text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer border-t lg:border-t-0 lg:border-r border-border min-w-0"
              >
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={condition}
                onChange={(e) => { setCondition(e.target.value); setPage(1); }}
                className="px-4 py-3 text-sm font-medium text-primary bg-transparent focus:outline-none cursor-pointer border-t lg:border-t-0 lg:border-r border-border min-w-0"
              >
                <option value="">All Conditions</option>
                {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                type="button"
                className="px-8 py-3 rounded-xl lg:rounded-r-full lg:rounded-l-none bg-accent text-white font-bold text-sm uppercase tracking-wide hover:bg-accent-hover transition-colors whitespace-nowrap mt-1 lg:mt-0"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====== RECOMMENDED GEAR SECTIONS ====== */}
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

      {/* ====== CONTENT ====== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {sorted.length === 0 ? (
          <EmptyState message="No items match your filters." />
        ) : (
          <>
            {/* ====== FEATURED CARDS ====== */}
            {page === 1 && !hasActiveFilters && topCards.length > 0 && (
              <div className="mb-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-amber-500">&#9733;</span> {allFeatured.length > 0 ? "Featured Items" : "Top Items"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topCards.map((item) => (
                    <ListingCard
                      key={item.id}
                      href={`/shop/${item.slug}`}
                      title={item.name}
                      subtitle={`${item.city}, ${item.state}`}
                      image={item.imageUrl || (item.photos && item.photos[0]) || undefined}
                      badges={[
                        { label: item.category, variant: "green" },
                        { label: item.condition },
                      ]}
                      details={[{ label: "Price", value: item.price }]}
                      featured
                      description={item.description ? item.description.replace(/<[^>]*>/g, "").split(" ").slice(0, 25).join(" ") + (item.description.replace(/<[^>]*>/g, "").split(" ").length > 25 ? "..." : "") : undefined}
                      cta="View Item"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ====== RESULTS COUNT ====== */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted font-medium">
                {nonFeaturedItems.length} item{nonFeaturedItems.length !== 1 ? "s" : ""} found
                {!viewAll && totalPages > 1 && <> &middot; Page {page} of {totalPages}</>}
              </p>
              {nonFeaturedItems.length > PER_PAGE && (
                <button
                  onClick={() => { setViewAll(!viewAll); setPage(1); }}
                  className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
                >
                  {viewAll ? "Show Pages" : "View All"}
                </button>
              )}
            </div>

            {/* ====== NON-FEATURED ROWS ====== */}
            <div className="space-y-3">
              {visibleNonFeatured.map((item) => {
                const img = item.imageUrl || (item.photos && item.photos[0]);
                return (
                  <a
                    key={item.id}
                    href={`/shop/${item.slug}`}
                    className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Red accent trim */}
                    <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />

                    {/* Image thumbnail */}
                    <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-surface flex items-center justify-center">
                        {img ? (
                          <img src={img} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <svg className="w-10 h-10 text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        )}
                      </div>
                    </div>

                    {/* Row content */}
                    <div className="flex items-start gap-5 sm:gap-6 flex-1 min-w-0 p-5 sm:p-6">

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-primary uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          {item.city}, {item.state}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">{item.category}</span>
                          <span className="px-3 py-1 rounded-full bg-surface text-muted text-xs font-medium">{item.condition}</span>
                          {item.price && (
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">{item.price}</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-primary mt-2.5 line-clamp-2 hidden sm:block leading-relaxed">
                            {item.description.replace(/<[^>]*>/g, "").split(" ").slice(0, 30).join(" ")}{item.description.replace(/<[^>]*>/g, "").split(" ").length > 30 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Arrow panel */}
                    <div className="hidden sm:flex items-center justify-center w-14 md:w-16 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
                      <span className="text-white text-2xl font-light">&#8250;</span>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* ====== PAGINATION ====== */}
            {!viewAll && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &larr; Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      p === page ? "bg-primary text-white" : "border border-border hover:bg-surface"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => { setPage(Math.min(totalPages, page + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next &rarr;
                </button>
              </div>
            )}

            <div className="mt-8"><AnytimeInlineCTA /></div>
          </>
        )}
      </div>
    </>
  );
}
