"use client";

import { useState, useRef } from "react";

// ── Video Embed ──────────────────────────────────────────────

function getEmbedUrl(url: string): { src: string; type: "video" | "youtube" | "vimeo" | "instagram" | "tiktok" } | null {
  // YouTube (regular, shorts, embeds, youtu.be)
  let match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/);
  if (match) return { src: `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`, type: "youtube" };
  // Vimeo
  match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (match) return { src: `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0&api=1`, type: "vimeo" };
  // TikTok video
  match = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (match) return { src: `https://www.tiktok.com/embed/v2/${match[1]}`, type: "tiktok" };
  // TikTok short link (vm.tiktok.com)
  if (/vm\.tiktok\.com\//.test(url) || /tiktok\.com\/t\//.test(url)) return { src: url, type: "tiktok" };
  // Instagram post/reel
  match = url.match(/instagram\.com\/(?:p|reel|reels)\/([\w-]+)/);
  if (match) return { src: `https://www.instagram.com/p/${match[1]}/embed`, type: "instagram" };
  return null;
}

function MuteButton({ muted, onClick }: { muted: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-3 right-3 z-10 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728" />
        </svg>
      )}
    </button>
  );
}

export function VideoEmbed({ url }: { url: string }) {
  const embed = getEmbedUrl(url);
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!embed) return null;

  function toggleMute() {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    const next = !muted;

    if (embed!.type === "youtube") {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: "command",
        func: next ? "mute" : "unMute",
        args: [],
      }), "*");
    } else if (embed!.type === "vimeo") {
      iframe.contentWindow.postMessage(JSON.stringify({
        method: "setVolume",
        value: next ? 0 : 1,
      }), "https://player.vimeo.com");
    }
    setMuted(next);
  }

  if (embed.type === "instagram") {
    return (
      <div className="rounded-xl overflow-hidden border border-border" style={{ maxWidth: 540 }}>
        <iframe src={embed.src} className="w-full border-0" style={{ minHeight: 500 }} allowFullScreen scrolling="no" />
      </div>
    );
  }
  if (embed.type === "tiktok") {
    // TikTok short links can't be embedded via iframe, show as link
    if (!embed.src.includes("/embed/")) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-4 rounded-xl border border-border bg-white hover:bg-surface transition-colors">
          <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.2 8.2 0 004.77 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/></svg>
          <span className="text-sm font-semibold text-primary">Watch on TikTok</span>
        </a>
      );
    }
    return (
      <div className="rounded-xl overflow-hidden border border-border" style={{ maxWidth: 340 }}>
        <iframe src={embed.src} className="w-full border-0" style={{ minHeight: 700 }} allowFullScreen scrolling="no" />
      </div>
    );
  }
  return (
    <div className="aspect-video rounded-xl overflow-hidden border border-border relative">
      <iframe ref={iframeRef} src={embed.src} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
      <MuteButton muted={muted} onClick={toggleMute} />
    </div>
  );
}

// ── Photo Gallery ────────────────────────────────────────────

export function PhotoGallery({ photos, imagePosition }: { photos: string[]; imagePosition?: number }) {
  if (!photos.length) return null;
  const pos = imagePosition ?? 50;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`Photo ${i + 1}`}
          className="w-full aspect-[4/3] object-cover rounded-xl border border-border"
          style={{ objectPosition: `center ${pos}%` }}
        />
      ))}
    </div>
  );
}

// ── Practice Schedule ────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PracticeSchedule({ days }: { days: string[] }) {
  if (!days.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((d) => (
        <span
          key={d}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            days.includes(d)
              ? "bg-accent/10 text-accent-hover border border-accent/20"
              : "bg-surface text-muted/40 border border-border"
          }`}
        >
          {d}
        </span>
      ))}
    </div>
  );
}

// ── Social Media Links ───────────────────────────────────────

export function SocialLinks({ website, facebook, instagram }: { website?: string; facebook?: string; instagram?: string }) {
  const links = [
    website && { label: "Website", href: website.startsWith("http") ? website : `https://${website}`, icon: "🌐" },
    instagram && { label: "Instagram", href: instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram}`, icon: "📷" },
    facebook && { label: "Facebook", href: facebook.startsWith("http") ? facebook : `https://facebook.com/${facebook}`, icon: "📘" },
  ].filter(Boolean) as { label: string; href: string; icon: string }[];

  if (!links.length) return null;

  return (
    <div className="flex gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted hover:bg-surface hover:text-primary transition-colors"
          title={l.label}
        >
          <span>{l.icon}</span>
          <span className="hidden sm:inline">{l.label}</span>
        </a>
      ))}
    </div>
  );
}

// ── Share Buttons ─────────────────────────────────────────────

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener"
        className="px-3 py-2 rounded-lg bg-[#1877F2] text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Facebook
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener"
        className="px-3 py-2 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        X
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=Check out this listing: ${encodedUrl}`}
        className="px-3 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-primary hover:bg-border transition-colors"
      >
        Email
      </a>
      <button
        onClick={copyLink}
        className="px-3 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-primary hover:bg-border transition-colors"
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
