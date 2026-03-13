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

export function BlogPostForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const listingType = searchParams.get("type") || "";
  const listingId = searchParams.get("id") || "";
  const listingSlug = searchParams.get("slug") || "";
  const listingName = searchParams.get("name") || "";

  const [title, setTitle] = useState("");
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
      <div className="max-w-[800px] mx-auto px-6 py-16 text-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  if (!session?.user?.id || !listingType || !listingId) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-16 text-center">
        <p className="text-muted">Invalid link. Please go back to your dashboard and click Write Blog Post.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
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
          title: title.trim(),
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
        setError(data.error || "Failed to publish blog post");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <>
      <div className="max-w-[800px] mx-auto px-6 py-3.5 text-sm text-muted">
        {listingName ? (
          <>
            <span className="text-primary">{listingName}</span>
            {" \u203A "}
          </>
        ) : null}
        <span>Write Blog Post</span>
      </div>

      <div className="max-w-[800px] mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-6">
            <h1 className="text-2xl font-extrabold text-white font-[family-name:var(--font-display)]">Write a Blog Post</h1>
            {listingName && (
              <p className="text-white/70 text-sm mt-1">Publishing as {listingName}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your blog post a title"
                className="w-full text-2xl font-bold px-4 py-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent font-[family-name:var(--font-display)] placeholder:text-gray-300 placeholder:font-normal"
                autoFocus
                required
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Cover Image</label>
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Cover" className="w-full rounded-xl max-h-[350px] object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white text-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    &#x2715;
                  </button>
                </div>
              ) : (
                <ImageUpload onUploaded={(url) => setImageUrl(url)} />
              )}
              <p className="text-xs text-muted mt-1.5">Add a cover image to make your blog post stand out</p>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Content *</label>
              <div className="border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent">
                <div className="flex items-center gap-1 px-3 py-2 bg-surface border-b border-border">
                  <button
                    type="button"
                    onClick={() => textareaRef.current && insertBold(textareaRef.current, body, setBody)}
                    className="px-2.5 py-1 rounded text-xs font-bold text-primary hover:bg-white transition-colors"
                    title="Bold (select text first)"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => textareaRef.current && insertLink(textareaRef.current, body, setBody)}
                    className="px-2.5 py-1 rounded text-xs font-bold text-primary hover:bg-white transition-colors"
                    title="Insert link"
                  >
                    &#128279;
                  </button>
                  <span className="text-[10px] text-muted ml-2">Select text then B to bold, or click link icon to add a hyperlink</span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your blog post content here...

Share your expertise, stories, training tips, match recaps, or anything your audience would love to read. Use paragraphs to organize your thoughts."
                  rows={16}
                  className="w-full text-[15px] leading-[1.8] px-5 py-4 focus:outline-none resize-y"
                  required
                />
              </div>
            </div>

            {/* Video */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Embed Video <span className="font-normal text-muted">(optional)</span></label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube, YouTube Shorts, Vimeo, Instagram, or TikTok link"
                className="w-full text-sm px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            {/* CTA Button */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Call-to-Action Button <span className="font-normal text-muted">(optional)</span></label>
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
              <p className="text-xs text-muted mt-1.5">Add a button linking to your website, signup page, etc.</p>
            </div>

            {/* Social Preview Image */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Social Media Preview <span className="font-normal text-muted">(optional)</span></label>
              <p className="text-xs text-muted mb-2">This image shows when your post is shared on Facebook, X, etc. If not set, the cover image will be used.</p>
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

            {error && (
              <p className="text-sm text-red-600 font-medium bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={submitting || !title.trim() || !body.trim()}
                className="px-10 py-3.5 rounded-xl text-sm font-bold bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {submitting ? "Publishing..." : "Publish Blog Post"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3.5 rounded-xl text-sm font-medium text-muted hover:bg-surface transition-colors"
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
