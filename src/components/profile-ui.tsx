"use client";

import { useState } from "react";

// ── Video Embed ──────────────────────────────────────────────

function getEmbedUrl(url: string): string | null {
  // YouTube
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  // Vimeo
  match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (match) return `https://player.vimeo.com/video/${match[1]}`;
  return null;
}

export function VideoEmbed({ url }: { url: string }) {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;
  return (
    <div className="aspect-video rounded-xl overflow-hidden border border-border">
      <iframe src={embedUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
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
