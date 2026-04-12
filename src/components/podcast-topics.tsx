"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { PodcastTopic } from "@/lib/db";
import { ImageUpload } from "@/components/image-upload";

function EmbedPlayer({ embedUrl, embedHtml }: { embedUrl?: string; embedHtml?: string }) {
  if (embedHtml) {
    return <div className="mt-2 rounded-lg overflow-hidden" dangerouslySetInnerHTML={{ __html: embedHtml }} />;
  }
  if (!embedUrl) return null;

  // Spotify
  if (embedUrl.includes("spotify.com")) {
    const spotifyUrl = embedUrl.replace("spotify.com/episode/", "spotify.com/embed/episode/")
      .replace("spotify.com/show/", "spotify.com/embed/show/");
    const src = spotifyUrl.includes("/embed/") ? spotifyUrl : `https://open.spotify.com/embed/episode/${embedUrl.split("/").pop()}`;
    return <iframe src={src} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="mt-2 rounded-lg" />;
  }

  // Apple Podcasts
  if (embedUrl.includes("podcasts.apple.com")) {
    const src = embedUrl.replace("podcasts.apple.com", "embed.podcasts.apple.com");
    return <iframe src={src} width="100%" height="175" frameBorder="0" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation" allow="autoplay *; encrypted-media *; clipboard-write" className="mt-2 rounded-lg" />;
  }

  // YouTube
  if (embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be")) {
    let videoId = "";
    if (embedUrl.includes("youtu.be/")) videoId = embedUrl.split("youtu.be/")[1]?.split("?")[0] || "";
    else if (embedUrl.includes("v=")) videoId = embedUrl.split("v=")[1]?.split("&")[0] || "";
    else if (embedUrl.includes("/embed/")) videoId = embedUrl.split("/embed/")[1]?.split("?")[0] || "";
    if (videoId) return <iframe src={`https://www.youtube.com/embed/${videoId}`} width="100%" height="200" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="mt-2 rounded-lg" />;
  }

  // Generic link fallback
  return (
    <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm text-accent font-semibold hover:underline">
      Listen →
    </a>
  );
}

export function PodcastTopicsSection({ podcastId, podcastSlug, ownerId }: { podcastId: string; podcastSlug: string; ownerId: string | null }) {
  const { data: session } = useSession();
  const isOwner = !!(ownerId && session?.user?.id === ownerId) || (session?.user as any)?.role === "admin";
  const [topics, setTopics] = useState<PodcastTopic[]>([]);
  const [loading, setLoading] = useState(true);

  // Topic form
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [topicImage, setTopicImage] = useState("");

  // Episode form
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);
  const [epTopicId, setEpTopicId] = useState("");
  const [epTitle, setEpTitle] = useState("");
  const [epDesc, setEpDesc] = useState("");
  const [epEmbedUrl, setEpEmbedUrl] = useState("");
  const [epEmbedHtml, setEpEmbedHtml] = useState("");
  const [embedMode, setEmbedMode] = useState<"url" | "html">("url");

  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleTogglePin = async (topicId: string) => {
    await fetch("/api/podcast-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "togglePin", podcastId, topicId }),
    });
    fetchTopics();
  };

  const handleReorder = async (topicId: string, direction: "up" | "down") => {
    const idx = topics.findIndex(t => t.id === topicId);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === topics.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newOrder = topics.map((t, i) => {
      if (i === idx) return { id: topics[swapIdx].id, sort: i };
      if (i === swapIdx) return { id: topics[idx].id, sort: i };
      return { id: t.id, sort: i };
    });
    await fetch("/api/podcast-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", podcastId, order: newOrder }),
    });
    fetchTopics();
  };

  const fetchTopics = useCallback(async () => {
    const res = await fetch(`/api/podcast-topics?podcastId=${podcastId}`);
    const data = await res.json();
    setTopics(data.topics || []);
    setLoading(false);
  }, [podcastId]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const handleCreateTopic = async () => {
    if (!topicTitle.trim()) return;
    setSaving(true);
    await fetch("/api/podcast-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "createTopic", podcastId, title: topicTitle, description: topicDesc || undefined, previewImage: topicImage || undefined }),
    });
    setTopicTitle(""); setTopicDesc(""); setTopicImage(""); setShowTopicForm(false);
    setSaving(false);
    fetchTopics();
  };

  const handleCreateEpisode = async () => {
    if (!epTopicId) return;
    if (!epEmbedUrl && !epEmbedHtml) return;
    setSaving(true);
    await fetch("/api/podcast-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "createEpisode", podcastId, topicId: epTopicId,
        title: epTitle || undefined, description: epDesc || undefined,
        embedUrl: embedMode === "url" ? epEmbedUrl : undefined,
        embedHtml: embedMode === "html" ? epEmbedHtml : undefined,
      }),
    });
    setEpTitle(""); setEpDesc(""); setEpEmbedUrl(""); setEpEmbedHtml(""); setShowEpisodeForm(false);
    setSaving(false);
    fetchTopics();
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Delete this topic and all its episodes?")) return;
    await fetch("/api/podcast-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteTopic", podcastId, topicId }),
    });
    fetchTopics();
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!confirm("Delete this episode?")) return;
    await fetch("/api/podcast-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteEpisode", podcastId, episodeId }),
    });
    fetchTopics();
  };

  if (loading) return null;
  if (topics.length === 0 && !isOwner) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold text-primary uppercase tracking-tight">Topics</h2>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button onClick={() => setShowTopicForm(!showTopicForm)} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">
              + New Topic
            </button>
            {topics.length > 0 && (
              <button onClick={() => { setShowEpisodeForm(!showEpisodeForm); if (!epTopicId && topics.length > 0) setEpTopicId(topics[0].id); }} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">
                + Add Episode
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 pt-4 space-y-4">
        {/* Create Topic Form */}
        {isOwner && showTopicForm && (
          <div className="bg-white rounded-xl p-4 space-y-3 border border-border">
            <p className="text-sm font-bold text-primary">New Topic</p>
            <input
              type="text" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="Topic title (e.g. Youth Development)" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent"
            />
            <textarea
              value={topicDesc} onChange={(e) => setTopicDesc(e.target.value)}
              placeholder="Description (optional)" rows={2} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent resize-none"
            />
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Preview Image (optional)</label>
              {topicImage ? (
                <div className="relative inline-block">
                  <img src={topicImage} alt="Preview" className="max-h-[100px] rounded-lg object-cover" />
                  <button type="button" onClick={() => setTopicImage("")} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80">&#x2715;</button>
                </div>
              ) : (
                <ImageUpload onUploaded={(url) => setTopicImage(url)} />
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateTopic} disabled={saving || !topicTitle.trim()} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Create Topic"}
              </button>
              <button onClick={() => setShowTopicForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Episode Form */}
        {isOwner && showEpisodeForm && topics.length > 0 && (
          <div className="bg-white rounded-xl p-4 space-y-3 border border-border">
            <p className="text-sm font-bold text-primary">Add Episode</p>
            <select
              value={epTopicId} onChange={(e) => setEpTopicId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent"
            >
              {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <input
              type="text" value={epTitle} onChange={(e) => setEpTitle(e.target.value)}
              placeholder="Episode title (optional)" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent"
            />
            <textarea
              value={epDesc} onChange={(e) => setEpDesc(e.target.value)}
              placeholder="Description (optional)" rows={2} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent resize-none"
            />
            <div className="flex gap-2 mb-2">
              <button onClick={() => setEmbedMode("url")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${embedMode === "url" ? "bg-primary text-white" : "bg-white border border-border text-muted"}`}>
                Paste URL
              </button>
              <button onClick={() => setEmbedMode("html")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${embedMode === "html" ? "bg-primary text-white" : "bg-white border border-border text-muted"}`}>
                Paste Embed Code
              </button>
            </div>
            {embedMode === "url" ? (
              <input
                type="url" value={epEmbedUrl} onChange={(e) => setEpEmbedUrl(e.target.value)}
                placeholder="Paste Spotify, Apple Podcasts, or YouTube URL..." className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent"
              />
            ) : (
              <textarea
                value={epEmbedHtml} onChange={(e) => setEpEmbedHtml(e.target.value)}
                placeholder='Paste embed HTML (e.g. <iframe src="..."></iframe>)' rows={3} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm font-mono focus:outline-none focus:border-accent resize-none"
              />
            )}
            <div className="flex gap-2">
              <button onClick={handleCreateEpisode} disabled={saving || (!epEmbedUrl && !epEmbedHtml)} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Add Episode"}
              </button>
              <button onClick={() => setShowEpisodeForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Topics List */}
        {topics.length === 0 && isOwner && (
          <p className="text-sm text-muted text-center py-4">No topics yet. Create your first topic to start organizing episodes.</p>
        )}

        {(() => {
          const pinnedTopics = topics.filter(t => t.pinned);
          const otherTopics = topics.filter(t => !t.pinned);
          const displayTopics = [...pinnedTopics, ...otherTopics].slice(0, 3);
          const shownTopics = expanded ? topics : displayTopics;
          return shownTopics;
        })().map((topic) => (
          <a
            key={topic.id}
            href={`/podcasts/${podcastSlug}/topics/${topic.slug || topic.id}`}
            className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />
            {topic.previewImage && (
              <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-surface">
                  <img src={topic.previewImage} alt={topic.title} className="w-full h-full object-contain" />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0 p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight group-hover:text-accent transition-colors">{topic.title}</h3>
                {topic.description && <p className="text-sm text-primary/70 mt-1 line-clamp-2">{topic.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted">{topic.episodes.length} episode{topic.episodes.length !== 1 ? "s" : ""}</span>
                  <span className="text-sm font-semibold text-accent group-hover:text-accent-hover transition-colors">View Episodes →</span>
                </div>
              </div>
              {isOwner && (
                <div className="flex flex-col gap-1 flex-shrink-0 items-center">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReorder(topic.id, "up"); }}
                    className="text-muted hover:text-primary transition-colors p-0.5"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReorder(topic.id, "down"); }}
                    className="text-muted hover:text-primary transition-colors p-0.5"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleTogglePin(topic.id); }}
                    className={`text-[10px] transition-colors ${topic.pinned ? "text-amber-600 font-semibold" : "text-muted hover:text-amber-600"}`}
                  >
                    {topic.pinned ? "★" : "☆"}
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteTopic(topic.id); }}
                    className="text-[10px] text-muted hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center w-12 sm:w-14 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
              <span className="text-white text-2xl font-light">&#8250;</span>
            </div>
          </a>
        ))}

        {/* Expand / View All */}
        {topics.length > 0 && (
          <div className="flex items-center justify-center gap-4 pt-2">
            {!expanded && topics.length > (topics.filter(t => t.pinned).length > 0 ? topics.filter(t => t.pinned).length : 3) && (
              <button onClick={() => setExpanded(true)} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
                Show All {topics.length} Topics
              </button>
            )}
            <a href={`/podcasts/${podcastSlug}/topics`} className="text-sm font-semibold text-primary hover:text-accent transition-colors">
              View All Topics →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
