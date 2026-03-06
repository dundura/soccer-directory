"use client";

import { useState } from "react";

export function PhotoGallery({ photos, hasVideo }: { photos: string[]; hasVideo: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className={`grid grid-cols-2 gap-1.5 ${hasVideo ? "mb-3" : ""}`}>
        {photos.map((photo, i) => (
          <img
            key={i}
            src={photo}
            alt={`Photo ${i + 1}`}
            className="w-full aspect-[4/3] object-cover rounded-lg block cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelected(i)}
          />
        ))}
      </div>

      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-white/70 transition-colors z-10"
            aria-label="Close"
          >
            &times;
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected((selected - 1 + photos.length) % photos.length); }}
                className="absolute left-4 text-white text-4xl font-bold hover:text-white/70 transition-colors z-10"
                aria-label="Previous"
              >
                &#8249;
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected((selected + 1) % photos.length); }}
                className="absolute right-14 text-white text-4xl font-bold hover:text-white/70 transition-colors z-10"
                aria-label="Next"
              >
                &#8250;
              </button>
            </>
          )}

          <img
            src={photos[selected]}
            alt={`Photo ${selected + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
