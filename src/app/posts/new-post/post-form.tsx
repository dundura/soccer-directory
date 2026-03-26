"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageUpload } from "@/components/image-upload";
import { RichTextEditor } from "@/components/rich-text-editor";

export function PostForm() {
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

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  if (status === "loading") {
    return <div className="max-w-[800px] mx-auto px-6 py-16 text-center"><div className="animate-pulse text-muted">Loading...</div></div>;
  }

  if (!session?.user?.id || !listingType || !listingId) {
    return <div className="max-w-[800px] mx-auto px-6 py-16 text-center"><p className="text-muted">Invalid link. Please go back to your listing and click Create Post.</p></div>;
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
          title: title.trim() || undefined,
          body: body.trim(),
          imageUrl: imageUrl || undefined,
          videoUrl: videoUrl || undefined,
          ctaUrl: ctaUrl || undefined,
          ctaLabel: ctaLabel || undefined,
          ogImageUrl: ogImageUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      const typePaths: Record<string, string> = {
        club: "clubs", team: "teams", trainer: "trainers", camp: "camps",
        tournament: "tournaments", futsal: "futsal", podcast: "podcasts",
        service: "services", tryout: "tryouts", specialevent: "special-events",
        guest: "guest-play", trip: "international-trips", fbgroup: "facebook-groups",
        youtube: "youtube-channels", trainingapp: "training-apps", ebook: "ebooks",
        giveaway: "giveaways", blog: "blogs", recruiter: "college-recruiting",
        instagrampage: "instagram-pages", tiktokpage: "tiktok-pages",
      };
      router.push(`/${typePaths[listingType] || listingType}/${listingSlug}`);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <a href={`/dashboard`} className="text-sm text-muted hover:text-primary transition-colors">&larr; Back</a>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mt-3">Create Post</h1>
        {listingName && <p className="text-muted text-sm mt-1">Posting as {listingName}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 md:p-8 border border-border">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your post a headline..."
            className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Post Content *</label>
          <RichTextEditor content={body} onChange={setBody} placeholder="Share an update, news, or announcement..." minHeight="200px" />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Image (optional)</label>
          {imageUrl ? (
            <div className="relative inline-block">
              <img src={imageUrl} alt="Preview" className="max-h-[200px] rounded-xl object-cover" />
              <button type="button" onClick={() => setImageUrl("")} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm flex items-center justify-center hover:bg-black/80">&#x2715;</button>
            </div>
          ) : (
            <ImageUpload onUploaded={(url) => setImageUrl(url)} />
          )}
        </div>

        {/* Video */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Video URL (optional)</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube, Vimeo, or Instagram URL"
            className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {/* CTA Button */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">CTA Button Label (optional)</label>
            <input type="text" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="e.g. Learn More, Sign Up" className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">CTA URL (optional)</label>
            <input type="url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
        </div>

        {/* Preview Image */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Preview Image (optional — shown when link is shared on social media)</label>
          {ogImageUrl ? (
            <div className="relative inline-block">
              <img src={ogImageUrl} alt="Preview" className="max-h-[160px] rounded-xl object-cover" />
              <button type="button" onClick={() => setOgImageUrl("")} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm flex items-center justify-center hover:bg-black/80">&#x2715;</button>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageUpload onUploaded={(url) => setOgImageUrl(url)} />
              <input type="url" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} placeholder="Or paste an image URL" className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
          )}
        </div>

        {error && <p className="text-accent text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="px-8 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Publish Post"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-border text-sm hover:bg-surface transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
