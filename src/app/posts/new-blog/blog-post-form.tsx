"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageUpload } from "@/components/image-upload";
import { RichTextEditor } from "@/components/rich-text-editor";

export function BlogPostForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [listingImages, setListingImages] = useState<string[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch listing images and auto-populate body
  useEffect(() => {
    if (!listingType || !listingId || imagesLoaded) return;
    fetch(`/api/listing-images?type=${listingType}&id=${listingId}`)
      .then((r) => r.json())
      .then((images: string[]) => {
        setListingImages(images);
        if (images.length > 0) {
          const toAdd = images.slice(0, 3);
          const imgHtml = toAdd.map((url) => `<img src="${url}" />`).join("\n<p></p>\n");
          setBody(`<p></p>\n${imgHtml}\n<p></p>`);
          if (!imageUrl) setImageUrl(toAdd[0]);
        }
        setImagesLoaded(true);
      })
      .catch(() => setImagesLoaded(true));
  }, [listingType, listingId, imagesLoaded, imageUrl]);

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

          {/* Formatting note */}
          <div className="mx-8 mt-6 px-5 py-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Just focus on writing!</strong> Our team will review and format your blog post to make it look great before it goes live. Don&apos;t worry about making it perfect — just share your story, tips, or expertise.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6 bg-white rounded-2xl border border-border">
            {/* Cover Image - at the top */}
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

              {/* Quick pick from listing images */}
              {listingImages.length > 0 && !imageUrl && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted mb-2">Or pick from your listing photos:</p>
                  <div className="flex gap-2 flex-wrap">
                    {listingImages.slice(0, 6).map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImageUrl(url)}
                        className="w-16 h-16 rounded-lg overflow-hidden border-2 border-border hover:border-accent transition-colors"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

            {/* Body - Rich Text Editor */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Content *</label>
              <RichTextEditor
                content={body}
                onChange={setBody}
                placeholder="Write your blog post content here... Share your expertise, stories, training tips, match recaps, or anything your audience would love to read."
                minHeight="350px"
              />
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
                <div className="space-y-2">
                  <ImageUpload onUploaded={(url) => setOgImageUrl(url)} />
                  <input type="url" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} placeholder="Or paste an image URL" className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={submitting || !title.trim() || !body.replace(/<[^>]*>/g, "").trim()}
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
