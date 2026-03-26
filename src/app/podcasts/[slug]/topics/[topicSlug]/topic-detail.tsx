"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { PodcastTopic } from "@/lib/db";
import { ImageUpload } from "@/components/image-upload";

function EmbedPlayer({ embedUrl, embedHtml }: { embedUrl?: string; embedHtml?: string }) {
  if (embedHtml) {
    return <div className="mt-3 rounded-lg overflow-hidden" dangerouslySetInnerHTML={{ __html: embedHtml }} />;
  }
  if (!embedUrl) return null;
  if (embedUrl.includes("spotify.com")) {
    const src = embedUrl.includes("/embed/") ? embedUrl : embedUrl.replace("spotify.com/episode/", "spotify.com/embed/episode/").replace("spotify.com/show/", "spotify.com/embed/show/");
    return <iframe src={src} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="mt-3 rounded-lg" />;
  }
  if (embedUrl.includes("podcasts.apple.com")) {
    return <iframe src={embedUrl.replace("podcasts.apple.com", "embed.podcasts.apple.com")} width="100%" height="175" frameBorder="0" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation" allow="autoplay *; encrypted-media *; clipboard-write" className="mt-3 rounded-lg" />;
  }
  if (embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be")) {
    let videoId = "";
    if (embedUrl.includes("youtu.be/")) videoId = embedUrl.split("youtu.be/")[1]?.split("?")[0] || "";
    else if (embedUrl.includes("v=")) videoId = embedUrl.split("v=")[1]?.split("&")[0] || "";
    else if (embedUrl.includes("/embed/")) videoId = embedUrl.split("/embed/")[1]?.split("?")[0] || "";
    if (videoId) return <iframe src={`https://www.youtube.com/embed/${videoId}`} width="100%" height="315" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="mt-3 rounded-lg" />;
  }
  return <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-accent font-semibold hover:underline">Listen →</a>;
}

export function PodcastTopicDetail({ topic, podcastId, podcastSlug, ownerId }: { topic: PodcastTopic; podcastId: string; podcastSlug: string; ownerId: string | null }) {
  const { data: session } = useSession();
  const isOwner = !!(ownerId && session?.user?.id === ownerId) || (session?.user as any)?.role === "admin";

  const [showForm, setShowForm] = useState(false);
  const [epTitle, setEpTitle] = useState("");
  const [epDesc, setEpDesc] = useState("");
  const [epEmbedUrl, setEpEmbedUrl] = useState("");
  const [epEmbedHtml, setEpEmbedHtml] = useState("");
  const [embedMode, setEmbedMode] = useState<"url" | "html">("url");
  const [saving, setSaving] = useState(false);

  // Edit topic
  const [showEditTopic, setShowEditTopic] = useState(false);
  const [topicTitle, setTopicTitle] = useState(topic.title);
  const [topicDesc, setTopicDesc] = useState(topic.description || "");
  const [topicImage, setTopicImage] = useState(topic.previewImage || "");
  const [topicSlugEdit, setTopicSlugEdit] = useState(topic.slug || "");

  const handleSaveTopic = async () => {
    setSaving(true);
    await fetch("/api/podcast-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateTopic", podcastId, topicId: topic.id, title: topicTitle, description: topicDesc, previewImage: topicImage, slug: topicSlugEdit }),
    });
    setSaving(false);
    window.location.reload();
  };

  // Edit episode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const handleEdit = (ep: { id: string; title?: string; description?: string; slug?: string }) => {
    setEditingId(ep.id);
    setEditTitle(ep.title || "");
    setEditDesc(ep.description || "");
    setEditSlug(ep.slug || "");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    await fetch("/api/podcast-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateEpisode", podcastId, episodeId: editingId, title: editTitle, description: editDesc, slug: editSlug }),
    });
    setSaving(false);
    setEditingId(null);
    window.location.reload();
  };

  const handleAdd = async () => {
    if (!epEmbedUrl && !epEmbedHtml) return;
    setSaving(true);
    await fetch("/api/podcast-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "createEpisode", podcastId, topicId: topic.id,
        title: epTitle || undefined, description: epDesc || undefined,
        embedUrl: embedMode === "url" ? epEmbedUrl : undefined,
        embedHtml: embedMode === "html" ? epEmbedHtml : undefined,
      }),
    });
    setSaving(false);
    window.location.reload();
  };

  const handleDelete = async (episodeId: string) => {
    if (!confirm("Delete this episode?")) return;
    await fetch("/api/podcast-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteEpisode", podcastId, episodeId }),
    });
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowEditTopic(!showEditTopic)} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-primary hover:bg-surface transition-colors">
            Edit Topic
          </button>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors">
            + Add Episode
          </button>
        </div>
      )}

      {isOwner && showEditTopic && (
        <div className="bg-white rounded-xl p-5 border border-border space-y-3">
          <p className="text-sm font-bold text-primary">Edit Topic</p>
          <input type="text" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} placeholder="Topic title" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
          <textarea value={topicDesc} onChange={(e) => setTopicDesc(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent resize-none" />
          <div>
            <label className="block text-xs font-medium text-muted mb-1">URL Slug</label>
            <input type="text" value={topicSlugEdit} onChange={(e) => setTopicSlugEdit(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm font-mono focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Preview Image</label>
            {topicImage ? (
              <div className="relative inline-block">
                <img src={topicImage} alt="Preview" className="max-h-[120px] rounded-lg object-cover" />
                <button type="button" onClick={() => setTopicImage("")} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80">&#x2715;</button>
              </div>
            ) : (
              <ImageUpload onUploaded={(url) => setTopicImage(url)} />
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSaveTopic} disabled={saving || !topicTitle.trim()} className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save Topic"}</button>
            <button onClick={() => setShowEditTopic(false)} className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {isOwner && showForm && (
        <div className="bg-white rounded-xl p-5 border border-border space-y-3">
          <p className="text-sm font-bold text-primary">Add Episode to {topic.title}</p>
          <input type="text" value={epTitle} onChange={(e) => setEpTitle(e.target.value)} placeholder="Episode title (optional)" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
          <textarea value={epDesc} onChange={(e) => setEpDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent resize-none" />
          <div className="flex gap-2 mb-2">
            <button onClick={() => setEmbedMode("url")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${embedMode === "url" ? "bg-primary text-white" : "bg-white border border-border text-muted"}`}>Paste URL</button>
            <button onClick={() => setEmbedMode("html")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${embedMode === "html" ? "bg-primary text-white" : "bg-white border border-border text-muted"}`}>Paste Embed Code</button>
          </div>
          {embedMode === "url" ? (
            <input type="url" value={epEmbedUrl} onChange={(e) => setEpEmbedUrl(e.target.value)} placeholder="Paste Spotify, Apple Podcasts, or YouTube URL..." className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
          ) : (
            <textarea value={epEmbedHtml} onChange={(e) => setEpEmbedHtml(e.target.value)} placeholder='Paste embed HTML (e.g. <iframe src="..."></iframe>)' rows={3} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm font-mono focus:outline-none focus:border-accent resize-none" />
          )}
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || (!epEmbedUrl && !epEmbedHtml)} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">{saving ? "Saving..." : "Add Episode"}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {topic.episodes.length === 0 && (
        <p className="text-muted text-center py-8">No episodes in this topic yet.</p>
      )}

      {topic.episodes.map((ep) => (
        <div key={ep.id} className="bg-white rounded-xl border border-border p-5 sm:p-6">
          {editingId === ep.id ? (
            <div className="space-y-3">
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Episode title" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent" />
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" rows={3} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent resize-none" />
              <div>
                <label className="block text-xs font-medium text-muted mb-1">URL Slug</label>
                <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm font-mono focus:outline-none focus:border-accent" />
                <p className="text-xs text-muted mt-1">Episode URL: /podcasts/{podcastSlug}/episodes/{editSlug || "..."}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
              </div>
              <EmbedPlayer embedUrl={ep.embedUrl} embedHtml={ep.embedHtml} />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {ep.title && <a href={`/podcasts/${podcastSlug}/episodes/${ep.slug || ep.id}`} className="hover:text-accent transition-colors"><h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight hover:text-accent">{ep.title}</h3></a>}
                  {ep.description && <p className="text-sm text-primary/70 mt-1 leading-relaxed">{ep.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <a href={`/podcasts/${podcastSlug}/episodes/${ep.slug || ep.id}`} className="text-xs font-semibold text-accent hover:underline">Share Episode →</a>
                    {ep.slug && <span className="text-[10px] text-muted font-mono">/{ep.slug}</span>}
                  </div>
                </div>
                {isOwner && (
                  <div className="flex gap-3 flex-shrink-0">
                    <button onClick={() => handleEdit(ep)} className="text-xs text-accent hover:text-accent-hover transition-colors">Edit</button>
                    <button onClick={() => handleDelete(ep.id)} className="text-xs text-muted hover:text-red-500 transition-colors">Delete</button>
                  </div>
                )}
              </div>
              <EmbedPlayer embedUrl={ep.embedUrl} embedHtml={ep.embedHtml} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
