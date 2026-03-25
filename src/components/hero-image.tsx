"use client";

import { useState } from "react";

const OVERLAY_PHRASES = [
  "Focused on Player Development",
  "Building Champions Every Day",
  "Where Passion Meets Performance",
  "Developing Future Leaders",
  "Excellence on the Pitch",
  "Inspiring the Next Generation",
  "Train Hard, Play Smart",
  "Elevating the Game",
  "Where Players Come First",
  "Grow the Game, Grow the Player",
  "Commitment to Excellence",
  "Building Skills for Life",
  "The Beautiful Game Starts Here",
  "Play with Purpose",
  "Stronger Together",
];

function getPhrase(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return OVERLAY_PHRASES[Math.abs(hash) % OVERLAY_PHRASES.length];
}

export function isHeroColor(src: string): boolean {
  return src.startsWith("color:");
}

export function getHeroColor(src: string): string {
  return src.replace("color:", "");
}

export function HeroImage({ src, alt, id, imagePosition }: { src: string; alt: string; id: string; imagePosition?: number }) {
  const [open, setOpen] = useState(false);
  const phrase = getPhrase(id);
  const isColor = isHeroColor(src);
  const pos = imagePosition ?? 50;
  return (
    <>
      <div className={`relative min-h-[180px] max-h-[320px] bg-surface ${!isColor ? "cursor-zoom-in" : ""}`} onClick={() => !isColor && setOpen(true)}>
        {isColor ? (
          <div className="w-full h-[220px]" style={{ backgroundColor: getHeroColor(src) }} />
        ) : (
          <img src={src} alt={alt} className="w-full h-full object-contain block max-h-[320px]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <span className="absolute bottom-10 left-5 right-5 text-white text-sm font-semibold tracking-wide drop-shadow-lg">
          {phrase}
        </span>
      </div>
      {open && !isColor && (
        <div
          className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl transition-colors"
            aria-label="Close"
          >
            &#x2715;
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
