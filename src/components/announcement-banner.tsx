'use client';

import { useState } from 'react';

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div style={{ background: '#DC373E', color: 'white', textAlign: 'center', padding: '10px 48px', position: 'relative' }}>
      <a
        href="https://www.anytime-soccer.com/the-most-important-skill-in-youth-soccer"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '16px' }}
      >
        ⬇ Download the FREE E-BOOK &ldquo;The Most Important Skill In Youth Soccer&rdquo;
      </a>
      <button
        onClick={() => setDismissed(true)}
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.8)', fontSize: '18px', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
        aria-label="Dismiss banner"
      >
        ✕
      </button>
    </div>
  );
}
