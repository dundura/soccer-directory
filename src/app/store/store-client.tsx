"use client";

import { useState } from "react";

type Product = {
  title: string;
  image: string;
  href: string;
  price?: string;
};

type Section = {
  id: string;
  icon: string;
  title: string;
  description: string;
  products: Product[];
};

const sections: Section[] = [
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

export function StoreClient() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(sections.map((s) => [s.id, true]))
  );

  function toggle(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Soccer Gear We Recommend
          </h1>
          <p className="text-white/70 max-w-2xl text-lg">
            Trusted equipment and resources to help your player train, recover, and perform at their best.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {sections.map((section) => {
            const isOpen = openSections[section.id];
            return (
              <div key={section.id} className="mb-4">
                {/* Collapsible Header */}
                <button
                  onClick={() => toggle(section.id)}
                  className="w-full flex items-center justify-between py-6 border-b-2 border-border text-left group"
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
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Products Grid */}
                {isOpen && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-8 pb-4">
                    {section.products.map((product) => (
                      <div
                        key={product.title}
                        className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full aspect-square object-contain p-4 border-b border-border bg-white"
                        />
                        <div className="p-4 flex flex-col flex-1">
                          <p className="text-sm font-semibold mb-3 flex-1 leading-snug">{product.title}</p>
                          <a
                            href={product.href}
                            target="_blank"
                            rel="noopener"
                            className="block w-full py-2.5 rounded-xl bg-accent text-white text-center font-semibold hover:bg-accent-hover transition-colors text-sm"
                          >
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
        </div>

        {/* Affiliate Disclosure */}
        <div className="border-t border-border bg-surface py-8">
          <p className="text-center text-sm text-muted max-w-xl mx-auto px-4">
            <strong>Disclosure:</strong> As an Amazon Associate and affiliate partner, we earn from qualifying purchases. This helps support our site at no extra cost to you.
          </p>
        </div>
      </div>
    </>
  );
}
