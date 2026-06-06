"use client";

import { useState } from "react";

type Episode = {
  title: string;
  url: string;
  description?: string;
  pubDate?: string;
  duration?: string;
};

export function EpisodesList({ episodes }: { episodes: Episode[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? episodes : episodes.slice(0, 3);

  return (
    <>
      <div className="space-y-3">
        {visible.map((ep, i) => (
          <a
            key={i}
            href={ep.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-surface transition-colors group"
          >
            <span className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <span className="block font-semibold text-sm text-primary group-hover:text-accent-hover transition-colors">{ep.title}</span>
              {ep.description && <span className="block text-xs text-muted mt-0.5 line-clamp-2">{ep.description}</span>}
              <span className="block text-xs text-muted mt-1">
                {ep.pubDate && new Date(ep.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {ep.duration && <> &middot; {ep.duration}</>}
              </span>
            </div>
            <span className="shrink-0 text-muted text-xs ml-auto">↗</span>
          </a>
        ))}
      </div>

      {episodes.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-primary hover:bg-surface transition-colors"
        >
          {expanded ? "Show less" : `Show ${episodes.length - 3} more episode${episodes.length - 3 === 1 ? "" : "s"}`}
        </button>
      )}
    </>
  );
}
