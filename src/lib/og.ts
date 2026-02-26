import type { Metadata } from "next";

const FALLBACK_IMAGE = "https://www.soccer-near-me.com/og-image.png";

export function ogMeta(title: string, description: string, image?: string | null, url?: string): Metadata {
  const ogImage = image || FALLBACK_IMAGE;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Soccer Near Me",
      images: [{ url: ogImage, width: 1200, height: 630 }],
      ...(url ? { url: `https://www.soccer-near-me.com${url}` } : {}),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
