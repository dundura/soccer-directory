"use client";

import { useRef } from "react";

export function SectionCarousel({
  title,
  subtitle,
  viewAllHref,
  children,
}: {
  title: string;
  subtitle: string;
  viewAllHref?: string;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: -1 | 1) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 400, behavior: "smooth" });
  }

  return (
    <section className="py-8 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-extrabold uppercase tracking-tight">{title}</h2>
          <p className="text-muted mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center hover:bg-surface hover:border-primary/30 transition-colors"
              aria-label="Previous"
            >
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center hover:bg-surface hover:border-primary/30 transition-colors"
              aria-label="Next"
            >
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          {viewAllHref && <a href={viewAllHref} className="text-sm font-semibold text-accent-hover hover:text-accent transition-colors">View all &rarr;</a>}
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </section>
  );
}
