"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageUpload } from "@/components/image-upload";

export function CreatePostForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const listingType = searchParams.get("type") || "";
  const listingId = searchParams.get("id") || "";
  const listingSlug = searchParams.get("slug") || "";
  const listingName = searchParams.get("name") || "";

  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
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
            {/* Body */}
            <div>
              <label className="block text-sm font-bold text-primary mb-1.5">Post Content</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your post here... Share news, updates, tips, or anything your audience would love to read."
                rows={10}
                className="w-full text-[15px] leading-relaxed px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-y"
                autoFocus
              />
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
                placeholder="YouTube, YouTube Shorts, Vimeo, or Instagram link"
                className="w-full text-sm px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <p className="text-xs text-muted mt-1.5">Supports YouTube, YouTube Shorts, Vimeo, and Instagram posts/reels</p>
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
