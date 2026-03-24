export function PlayerAvatar({ src, name, className, imagePosition }: { src?: string | null; name?: string; className?: string; imagePosition?: number }) {
  if (src) {
    return <img src={src} alt={name || "Player"} className={className} style={imagePosition != null ? { objectPosition: `center ${imagePosition}%` } : undefined} />;
  }

  return (
    <div
      className={className}
      style={{ backgroundColor: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <svg viewBox="0 0 24 24" fill="none" style={{ width: "50%", height: "50%", opacity: 0.4 }}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#9CA3AF" />
      </svg>
    </div>
  );
}
