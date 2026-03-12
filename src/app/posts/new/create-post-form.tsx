"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageUpload } from "@/components/image-upload";

function insertBold(textarea: HTMLTextAreaElement, body: string, setBody: (v: string) => void) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = body.slice(start, end);
  if (selected) {
    const newBody = body.slice(0, start) + `<b>${selected}</b>` + body.slice(end);
    setBody(newBody);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 3, end + 3); }, 0);
  } else {
    const newBody = body.slice(0, start) + "<b></b>" + body.slice(end);
    setBody(newBody);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 3, start + 3); }, 0);
  }
}

function insertLink(textarea: HTMLTextAreaElement, body: string, setBody: (v: string) => void) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = body.slice(start, end);
  const url = prompt("Enter URL:", "https://");
  if (!url) return;
  const text = selected || prompt("Enter link text:", "") || url;
  const tag = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  const newBody = body.slice(0, start) + tag + body.slice(end);
  setBody(newBody);
  setTimeout(() => { textarea.focus(); }, 0);
}

export function CreatePostForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const listingType = searchParams.get("type") || "";
  const listingId = searchParams.get("id") || "";
  const listingSlug = searchParams.get("slug") || "";
  const listingName = searchParams.get("name") || "";

  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="max-w-[700px] mx-auto px-6 py-16 text-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  if (!session?.user?.id || !listingType || !listingId) {
    return (
      <div className="max-w-[700px] mx-auto px-6 py-16 text-center">
        <p className="text-muted">Invalid link. Please go back to your listing and click Create Post.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/listing-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: listingType,
          id: listingId,
          slug: listingSlug,
          body: body.trim(),
          imageUrl: imageUrl || undefined,
          videoUrl: videoUrl || undefined,
          ctaUrl: ctaUrl || undefined,
          ctaLabel: ctaLabel || undefined,
          ogImageUrl: ogImageUrl || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.slug) {
          router.push(`/posts/${data.slug}`);
        } else if (data.id) {
          router.push(`/posts/${data.id}`);
        } else {
          router.back();
        }
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create post");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <>
      <div className="max-w-[700px] mx-auto px-6 py-3.5 text-sm text-muted">
        {listingName ? (
          <>
            <span className="text-primary">{listingName}</span>
            {" \u203A "}
          </>
        ) : null}
        <span>Create Post</span>
      </div>

      <div className="max-w-[700px] mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <h1 className="text-xl font-extrabold text-primary">Create a Post</h1>
            {listingName && (
              <p className="text-sm text-muted mt-1">Posting as {listingName}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
            {/* Body with formatting toolbar */}
            <div>
              <label className="block text-sm font-bold text-primary mb-1.5">Post Content</label>
              <div className="border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-surface border-b border-border">
                  <button
                    type="button"
                    onClick={() => textareaRef.current && insertBold(textareaRef.current, body, setBody)}
                    className="px-2 py-1 rounded text-xs font-bold text-primary hover:bg-white transition-colors"
                    title="Bold (select text first)"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => textareaRef.current && insertLink(textareaRef.current, body, setBody)}
                    className="px-2 py-1 rounded text-xs font-bold text-primary hover:bg-white transition-colors"
                    title="Insert link (select text first for link text)"
                  >
                    &#128279;
                  </button>
                  <span className="text-[10px] text-muted ml-2">Select text then B to bold, or click link icon to add a hyperlink</span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your post here... Share news, updates, tips, or anything your audience would love to read."
                  rows={10}
                  className="w-full text-[15px] leading-relaxed px-4 py-3 focus:outline-none resize-y"
                  autoFocus
                />
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-bold text-primary mb-1.5">Image</label>
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Preview" className="w-full rounded-xl max-h-[300px] object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    &#x2715;
                  </button>
                </div>
              ) : (
                <ImageUpload onUploaded={(url) => setImageUrl(url)} />
              )}
            </div>

            {/* Video */}
            <div>
              <label className="block text-sm font-bold text-primary mb-1.5">Video / Social Embed</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube, YouTube Shorts, Vimeo, Instagram, or TikTok link"
                className="w-full text-sm px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <p className="text-xs text-muted mt-1.5">Supports YouTube, YouTube Shorts, Vimeo, Instagram posts/reels, and TikTok</p>
            </div>

            {/* Social Media Preview Image */}
            <div>
              <label className="block text-sm font-bold text-primary mb-1.5">Social Media Preview Image <span className="font-normal text-muted">(optional)</span></label>
              <p className="text-xs text-muted mb-2">This image shows when your post is shared on Facebook, X, etc. It won't appear in the post itself. For Instagram videos, take a screenshot and upload it here. TikTok thumbnails are grabbed automatically.</p>
              {ogImageUrl ? (
                <div className="relative">
                  <img src={ogImageUrl} alt="Preview" className="w-full rounded-xl max-h-[200px] object-cover" />
                  <button
                    type="button"
                    onClick={() => setOgImageUrl("")}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    &#x2715;
                  </button>
                </div>
              ) : (
                <ImageUpload onUploaded={(url) => setOgImageUrl(url)} />
              )}
            </div>

            {/* CTA Button */}
            <div>
              <label className="block text-sm font-bold text-primary mb-1.5">Call-to-Action Button <span className="font-normal text-muted">(optional)</span></label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://your-link.com"
                  className="flex-1 text-sm px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
                <input
                  type="text"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Learn More"
                  className="w-40 text-sm px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
              <p className="text-xs text-muted mt-1.5">Add a button that links to your website, signup page, etc. Default label: &quot;Learn More&quot;</p>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="px-8 py-3 rounded-xl text-sm font-bold bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {submitting ? "Publishing..." : "Publish Post"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl text-sm font-medium text-muted hover:bg-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
