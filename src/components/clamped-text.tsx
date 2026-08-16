"use client";

import { useState } from "react";

/**
 * Long free-text fields, clamped with the rest behind a button.
 *
 * Written for trainer credentials, where one coach listed 50-odd licenses and
 * the section became most of the page. A line clamp alone would hide the list
 * with no way to read it, so the full text opens in a dialog.
 *
 * Falls back to plain text when the value is short enough to not need any of
 * this — no button, no dialog, nothing to dismiss.
 */
export function ClampedText({
  text,
  className = "",
  clampLines = 8,
  threshold = 320,
  label = "Show all",
  title = "Details",
}: {
  text: string;
  className?: string;
  clampLines?: number;
  threshold?: number;
  label?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const needsClamp = (text || "").length > threshold;

  // These fields hold HTML, not plain text — the same content InlineEditField
  // renders with dangerouslySetInnerHTML. Rendering it as a string prints the
  // literal <p> tags. The tight [&>p]:mb-0 is deliberate: content pasted from a
  // PDF arrives as one paragraph per VISUAL line, so default paragraph spacing
  // puts a gap between the two halves of a single credential.
  const htmlClass = `${className} [&>p]:mb-0 [&>p]:leading-relaxed`;

  if (!needsClamp) {
    return <div className={htmlClass} dangerouslySetInnerHTML={{ __html: text }} />;
  }

  return (
    <>
      <div
        className={htmlClass}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: clampLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
      {/* Fewer lines than the dialog holds, so "Show all" is the obvious move.
          Once open, the dialog closes on tap-outside, Close, or the ×. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-bold text-accent hover:underline"
      >
        {label} →
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-[640px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <h4 className="font-[family-name:var(--font-display)] text-base font-extrabold text-primary uppercase tracking-tight">
                {title}
              </h4>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-2xl leading-none text-muted hover:text-primary"
              >
                &times;
              </button>
            </div>
            {/* The list is the reason this dialog exists, so it gets the scroll
                rather than the page behind it. */}
            {/* Two columns on anything wider than a phone. The entries are
                short — often three or four words — so a single column of fifty
                of them is a long scroll of mostly empty line. */}
            <div className="overflow-y-auto px-5 py-4">
              <div
                className="text-sm text-primary sm:columns-2 sm:gap-6 [&>p]:mb-0 [&>p]:leading-relaxed [&>p]:break-inside-avoid [&>p>strong]:block [&>p>strong]:mt-3 [&>p>strong]:mb-1"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            </div>
            <div className="border-t border-border px-5 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-lg bg-surface py-2.5 text-sm font-bold text-primary hover:bg-border transition-colors"
              >
                Show less
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
