"use client";

import { useState } from "react";

export function AnnouncementSection({
  heading,
  text,
  image,
}: {
  heading?: string;
  text: string;
  image?: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl overflow-hidden border-2 border-red-200/60 bg-gradient-to-br from-red-50 via-rose-50 to-red-50 relative">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-200/40 to-transparent rounded-bl-[4rem] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-rose-200/30 to-transparent rounded-tr-[3rem] pointer-events-none" />

        <div className="px-5 py-4 sm:px-6 sm:py-5 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-400/20 text-red-600 text-sm flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-base sm:text-lg font-bold text-red-800">
              {heading || "Special Announcement"}
            </h3>
          </div>

          {/* Content: image left + text right, or just text */}
          <div className={`flex ${image ? "flex-col sm:flex-row gap-4" : ""}`}>
            {image && (
              <button
                onClick={() => setLightboxOpen(true)}
                className="flex-shrink-0 rounded-xl overflow-hidden border border-red-200/60 hover:border-red-400 transition-colors cursor-zoom-in group"
              >
                <img
                  src={image}
                  alt={heading || "Announcement"}
                  className="w-full sm:w-40 sm:h-40 h-48 object-cover group-hover:scale-[1.02] transition-transform"
                />
              </button>
            )}
            <p className="text-sm sm:text-base leading-relaxed text-red-900/80 whitespace-pre-line">
              {text}
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox modal */}
      {lightboxOpen && image && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl transition-colors"
            aria-label="Close"
          >
            &#x2715;
          </button>
          <img
            src={image}
            alt={heading || "Announcement"}
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
