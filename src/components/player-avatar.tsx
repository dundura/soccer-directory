function getInitials(name?: string): string | null {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Soccer ball SVG for fallback when no name is available
const soccerBallSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" stroke="white" stroke-width="2"/><path d="M50 10 L62 30 L50 38 L38 30Z M85 40 L72 30 L76 45 L68 55Z M78 75 L68 55 L76 45 L85 60Z M50 90 L62 70 L50 62 L38 70Z M15 60 L24 45 L32 55 L22 75Z M15 40 L28 30 L24 45 L32 55Z" fill="white" opacity="0.3"/><polygon points="50,28 60,40 55,52 45,52 40,40" fill="white" opacity="0.4"/></svg>`;

export function PlayerAvatar({ src, name, className }: { src?: string | null; name?: string; className?: string }) {
  if (src) {
    return <img src={src} alt={name || "Player"} className={className} />;
  }

  const initials = getInitials(name);

  return (
    <div
      className={className}
      style={{ backgroundColor: "#0F3154", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {initials ? (
        <span
          style={{ color: "white", fontWeight: 700, fontSize: 76, lineHeight: 1, userSelect: "none", letterSpacing: 2 }}
        >
          {initials}
        </span>
      ) : (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "50%", height: "50%" }}>
          <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="3" opacity="0.6" />
          <polygon points="50,28 60,40 55,52 45,52 40,40" fill="white" opacity="0.5" />
          <polygon points="62,30 74,44 68,56 58,48 60,38" fill="white" opacity="0.35" />
          <polygon points="38,30 26,44 32,56 42,48 40,38" fill="white" opacity="0.35" />
          <polygon points="58,58 68,56 74,72 62,74 56,66" fill="white" opacity="0.35" />
          <polygon points="42,58 32,56 26,72 38,74 44,66" fill="white" opacity="0.35" />
        </svg>
      )}
    </div>
  );
}
