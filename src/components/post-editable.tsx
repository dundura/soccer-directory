"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { VideoEmbed } from "./profile-ui";
import { ImageUpload } from "./image-upload";

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

export function PostEditableContent({
  postId,
  title,
  body,
  slug,
  imageUrl,
  videoUrl,
  ctaUrl,
  ctaLabel,
  ogImageUrl,
  userId,
  blogLayout,
  profileName,
  profileUrl,
}: {
  postId: string;
  title?: string;
  body: string;
  slug: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaUrl?: string;
  ctaLabel?: string;
  ogImageUrl?: string;
  userId: string;
  blogLayout?: boolean;
  profileName?: string;
  profileUrl?: string;
}) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === userId;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const canEdit = isOwner || isAdmin;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [editingBody, setEditingBody] = useState(false);
  const [titleValue, setTitleValue] = useState(title || "");
  const [bodyValue, setBodyValue] = useState(body);
  const [saving, setSaving] = useState(false);

  const [editingMedia, setEditingMedia] = useState(false);
  const [imageValue, setImageValue] = useState(imageUrl || "");
  const [videoValue, setVideoValue] = useState(videoUrl || "");
  const [ctaUrlValue, setCtaUrlValue] = useState(ctaUrl || "");
  const [ctaLabelValue, setCtaLabelValue] = useState(ctaLabel || "");
  const [ogImageValue, setOgImageValue] = useState(ogImageUrl || "");
  const [mediaSaving, setMediaSaving] = useState(false);

  const [editingSlug, setEditingSlug] = useState(false);
  const [slugValue, setSlugValue] = useState(slug);
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleBodyClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      e.preventDefault();
      setLightboxSrc((target as HTMLImageElement).src);
    }
  }, []);

  async function saveBody() {
    setSaving(true);
    const res = await fetch("/api/listing-posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId, action: "edit_body", body: bodyValue, title: titleValue || undefined }),
    });
    if (res.ok) setEditingBody(false);
    setSaving(false);
  }

  async function saveMedia() {
    setMediaSaving(true);
    const res = await fetch("/api/listing-posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: postId,
        action: "edit_media",
        imageUrl: imageValue || null,
        videoUrl: videoValue || null,
        ctaUrl: ctaUrlValue || null,
        ctaLabel: ctaLabelValue || null,
        ogImageUrl: ogImageValue || null,
      }),
    });
    if (res.ok) {
      setEditingMedia(false);
      window.location.reload();
    }
    setMediaSaving(false);
  }

  async function saveSlug() {
    setSlugSaving(true);
    setSlugError("");
    const res = await fetch("/api/listing-posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId, action: "edit_slug", slug: slugValue }),
    });
    if (res.ok) {
      setEditingSlug(false);
      window.location.href = `/posts/${slugValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    } else {
      const json = await res.json();
      setSlugError(json.error || "Failed to update slug");
    }
    setSlugSaving(false);
  }

  const bodyClassName = blogLayout
    ? "blog-article-body"
    : "text-[15px] leading-relaxed text-gray-800 whitespace-pre-line [&_a]:text-accent [&_a]:underline [&_a]:hover:text-accent-hover";

  return (
    <>
      {/* Profile card + edit controls (blog layout, always at top) */}
      {blogLayout && profileName && profileUrl && (
        <div className="mb-8">
          <a
            href={profileUrl}
            className="flex items-center gap-4 px-5 py-4 rounded-xl bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
              {profileName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary group-hover:text-accent transition-colors">{profileName}</p>
              <p className="text-xs text-muted">View full profile &rarr;</p>
            </div>
          </a>
          {isAdmin && !editingBody && !editingMedia && (
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => setEditingBody(true)}
                className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                Edit Post
              </button>
              <button
                onClick={() => setEditingMedia(true)}
                className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                Edit Image / Video / CTA
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image - at the top (regular posts only; blog layout handles image in parent) */}
      {!blogLayout && imageUrl && !editingMedia && (
        <div className="px-4 pb-4">
          <img src={imageUrl} alt="" className="w-full rounded-xl object-cover" />
        </div>
      )}

      {/* Title + Body */}
      <div className={blogLayout ? "" : "px-6 pb-4"}>
        {editingBody ? (
          <div className="space-y-3">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              placeholder="Post title (optional)"
              className="w-full text-xl font-bold px-3 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent font-[family-name:var(--font-display)]"
            />
            <div className="border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/30">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-surface border-b border-border">
                <button
                  type="button"
                  onClick={() => textareaRef.current && insertBold(textareaRef.current, bodyValue, setBodyValue)}
                  className="px-2 py-1 rounded text-xs font-bold text-primary hover:bg-white transition-colors"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => textareaRef.current && insertLink(textareaRef.current, bodyValue, setBodyValue)}
                  className="px-2 py-1 rounded text-xs font-bold text-primary hover:bg-white transition-colors"
                  title="Insert link"
                >
                  &#128279;
                </button>
                <span className="text-[10px] text-muted ml-2">Select text then B to bold, or click link icon to add a hyperlink</span>
              </div>
              <textarea
                ref={textareaRef}
                value={bodyValue}
                onChange={(e) => setBodyValue(e.target.value)}
                rows={blogLayout ? 16 : 8}
                className="w-full text-[15px] leading-relaxed px-3 py-2.5 focus:outline-none resize-y"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setEditingBody(false); setBodyValue(body); setTitleValue(title || ""); }} className="px-4 py-2 rounded-lg text-xs font-medium text-muted hover:bg-surface transition-colors">Cancel</button>
              <button onClick={saveBody} disabled={saving} className="px-5 py-2 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {!blogLayout && titleValue && (
              <h1 className="text-2xl font-extrabold text-primary mb-3 font-[family-name:var(--font-display)]">{titleValue}</h1>
            )}
            <div className={`${bodyClassName} [&_img]:cursor-pointer [&_img]:hover:opacity-90 [&_img]:transition-opacity`} onClick={handleBodyClick} dangerouslySetInnerHTML={{ __html: bodyValue }} />
            {canEdit && (
              <button
                onClick={() => setEditingBody(true)}
                className="mt-2 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                Edit Post
              </button>
            )}
          </div>
        )}
      </div>

      {/* Video */}
      {videoUrl && !editingMedia && (
        <div className="px-4 pb-4">
          <VideoEmbed url={videoUrl} />
        </div>
      )}

      {/* CTA Button */}
      {ctaUrl && !editingMedia && (
        <div className="px-6 pb-4">
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 rounded-xl text-sm font-bold bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            {ctaLabel || "Learn More"} &rarr;
          </a>
        </div>
      )}

      {/* Media / CTA editor */}
      {canEdit && (
        editingMedia ? (
          <div className="px-6 pb-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Image</label>
              {imageValue ? (
                <div className="relative">
                  <img src={imageValue} alt="Preview" className="w-full rounded-xl max-h-[200px] object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageValue("")}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm flex items-center justify-center hover:bg-black/80"
                  >
                    &#x2715;
                  </button>
                </div>
              ) : (
                <ImageUpload onUploaded={(url) => setImageValue(url)} />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Video URL</label>
              <input
                type="url"
                value={videoValue}
                onChange={(e) => setVideoValue(e.target.value)}
                placeholder="YouTube, Shorts, Vimeo, or Instagram link"
                className="w-full text-xs px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1">CTA Button</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={ctaUrlValue}
                  onChange={(e) => setCtaUrlValue(e.target.value)}
                  placeholder="https://your-link.com"
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
                <input
                  type="text"
                  value={ctaLabelValue}
                  onChange={(e) => setCtaLabelValue(e.target.value)}
                  placeholder="Learn More"
                  className="w-32 text-xs px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
              <p className="text-[10px] text-muted mt-1">Leave URL empty to remove button. Default label: &quot;Learn More&quot;</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Social Media Preview Image <span className="font-normal text-muted">(optional)</span></label>
              <p className="text-[10px] text-muted mb-1.5">This image shows when the post is shared on Facebook/Twitter. Not displayed in the post itself.</p>
              {ogImageValue ? (
                <div className="relative">
                  <img src={ogImageValue} alt="OG Preview" className="w-full rounded-xl max-h-[150px] object-cover" />
                  <button
                    type="button"
                    onClick={() => setOgImageValue("")}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm flex items-center justify-center hover:bg-black/80"
                  >
                    &#x2715;
                  </button>
                </div>
              ) : (
                <ImageUpload onUploaded={(url) => setOgImageValue(url)} />
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setEditingMedia(false); setImageValue(imageUrl || ""); setVideoValue(videoUrl || ""); setCtaUrlValue(ctaUrl || ""); setCtaLabelValue(ctaLabel || ""); setOgImageValue(ogImageUrl || ""); }} className="px-4 py-2 rounded-lg text-xs font-medium text-muted hover:bg-surface transition-colors">Cancel</button>
              <button onClick={saveMedia} disabled={mediaSaving} className="px-5 py-2 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50">
                {mediaSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 pb-3">
            <button
              onClick={() => setEditingMedia(true)}
              className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
            >
              Edit Image / Video / CTA
            </button>
          </div>
        )
      )}

      {/* Slug editor */}
      {canEdit && (
        <div className="px-6 pb-4 border-t border-border pt-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-medium">URL:</span>
            {editingSlug ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-muted shrink-0">soccer-near-me.com/posts/</span>
                <input
                  value={slugValue}
                  onChange={(e) => setSlugValue(e.target.value)}
                  className="flex-1 px-2 py-1 rounded border border-border text-xs focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
                <button onClick={saveSlug} disabled={slugSaving} className="text-xs font-bold text-accent hover:text-accent-hover disabled:opacity-50">
                  {slugSaving ? "..." : "Save"}
                </button>
                <button onClick={() => { setEditingSlug(false); setSlugValue(slug); setSlugError(""); }} className="text-xs text-muted hover:text-primary">
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span className="text-primary">/posts/{slug}</span>
                <button onClick={() => setEditingSlug(true)} className="text-accent hover:text-accent-hover font-semibold">Edit</button>
              </>
            )}
          </div>
          {slugError && <p className="text-xs text-red-500 mt-1">{slugError}</p>}
        </div>
      )}

      {/* Blog article styles */}
      {blogLayout && (
        <style>{`
          .blog-article-body {
            font-size: 18px;
            line-height: 1.9;
            color: #333;
          }
          .blog-article-body h2 {
            font-size: 1.8em;
            font-weight: 700;
            color: #1f4e79;
            margin: 50px 0 20px;
            line-height: 1.3;
          }
          .blog-article-body h3 {
            font-size: 1.4em;
            font-weight: 600;
            color: #1f4e79;
            margin: 35px 0 15px;
            line-height: 1.3;
          }
          .blog-article-body h4 {
            font-size: 1.2em;
            font-weight: 600;
            color: #1f4e79;
            margin: 25px 0 10px;
          }
          .blog-article-body p {
            margin-bottom: 20px;
          }
          .blog-article-body strong {
            font-weight: 700;
          }
          .blog-article-body em {
            font-style: italic;
          }
          .blog-article-body u {
            text-decoration: underline;
          }
          .blog-article-body a {
            color: #DC373E;
            text-decoration: underline;
          }
          .blog-article-body a:hover {
            color: #b52d33;
          }
          .blog-article-body ul {
            list-style: disc;
            padding-left: 30px;
            margin-bottom: 20px;
          }
          .blog-article-body ol {
            list-style: decimal;
            padding-left: 30px;
            margin-bottom: 20px;
          }
          .blog-article-body li {
            margin-bottom: 10px;
          }
          .blog-article-body blockquote {
            border-left: 4px solid #DC373E;
            padding: 15px 20px;
            margin: 30px 0;
            background: #f9f9f9;
            font-style: italic;
            color: #555;
          }
          .blog-article-body img {
            max-width: 100%;
            border-radius: 12px;
            margin: 30px 0;
            cursor: pointer;
          }
          .blog-article-body img:hover {
            opacity: 0.9;
          }
          .blog-article-body hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 40px 0;
          }
          .blog-article-body table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .blog-article-body th {
            background: #1f4e79;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          .blog-article-body td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .blog-article-body tr:nth-child(even) td {
            background: #f9fafb;
          }
        `}</style>
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white text-xl flex items-center justify-center hover:bg-white/30 transition-colors"
            onClick={() => setLightboxSrc(null)}
          >
            &#x2715;
          </button>
          <img
            src={lightboxSrc}
            alt=""
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
