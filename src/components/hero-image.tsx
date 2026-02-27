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
  const phrase = getPhrase(id);
  const isColor = isHeroColor(src);
  const pos = imagePosition ?? 50;
  return (
    <div className="relative h-[220px]">
      {isColor ? (
        <div className="w-full h-full" style={{ backgroundColor: getHeroColor(src) }} />
      ) : (
        <img src={src} alt={alt} className="w-full h-full object-cover block" style={{ objectPosition: `center ${pos}%` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <span className="absolute bottom-4 left-5 text-white text-sm font-semibold tracking-wide drop-shadow-lg">
        {phrase}
      </span>
    </div>
  );
}
