"use client";

import { useState } from "react";

export function ExpandableCategories({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {!expanded && (
        <div className="text-center py-8">
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold text-base uppercase tracking-wide hover:bg-primary-light transition-colors"
          >
            More Categories
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
      {expanded && (
        <div>
          {children}
          <div className="text-center py-4">
            <button
              onClick={() => setExpanded(false)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-muted font-semibold text-sm hover:bg-surface transition-colors"
            >
              Show Less
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
