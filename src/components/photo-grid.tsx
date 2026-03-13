"use client";

import { useState } from "react";

export function PhotoGrid({ photos, alt = "Photo" }: { photos: string[]; alt?: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <>
      {photos.map((photo, i) => (
        <button
          key={i}
          onClick={() => setLightboxIdx(i)}
          className="cursor-zoom-in group overflow-hidden rounded-xl"
        >
          <img
            src={photo}
            alt={`${alt} ${i + 1}`}
            className="w-full aspect-square object-cover rounded-xl block group-hover:scale-[1.03] transition-transform duration-200"
          />
        </button>
      ))}

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl transition-colors"
            aria-label="Close"
          >
            &#x2715;
          </button>
          {photos.length > 1 && lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl transition-colors"
              aria-label="Previous"
            >
              &#8249;
            </button>
          )}
          {photos.length > 1 && lightboxIdx < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl transition-colors"
              aria-label="Next"
            >
              &#8250;
            </button>
          )}
          <img
            src={photos[lightboxIdx]}
            alt={`${alt} ${lightboxIdx + 1}`}
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
