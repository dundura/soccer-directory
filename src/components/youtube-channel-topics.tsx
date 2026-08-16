"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { YoutubeChannelTopic } from "@/lib/db";
import { ImageUpload } from "@/components/image-upload";

function YoutubeEmbed({ url }: { url: string }) {
  let videoId = "";
  if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
  else if (url.includes("v=")) videoId = url.split("v=")[1]?.split("&")[0] || "";
  else if (url.includes("/embed/")) videoId = url.split("/embed/")[1]?.split("?")[0] || "";
  if (!videoId) return <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent font-semibold hover:underline">Watch Video →</a>;
  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      width="100%" height="200"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="rounded-lg mt-2"
    />
  );
}

export function YoutubeChannelTopicsSection({ channelId, channelSlug, ownerId }: { channelId: string; channelSlug: string; ownerId: string | null }) {
  const { data: session } = useSession();
  const isOwner = !!(ownerId && session?.user?.id === ownerId) || (session?.user as any)?.role === "admin";
  const [topics, setTopics] = useState<YoutubeChannelTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Topic form
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [topicImage, setTopicImage] = useState("");

  // Video form
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [vidTopicId, setVidTopicId] = useState("");
  const [vidTitle, setVidTitle] = useState("");
  const [vidDesc, setVidDesc] = useState("");
  const [vidUrl, setVidUrl] = useState("");

  const fetchTopics = useCallback(async () => {
    const res = await fetch(`/api/youtube-channel-topics?channelId=${channelId}`);
    const data = await res.json();
    setTopics(data.topics || []);
    setLoading(false);
  }, [channelId]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const post = async (body: object) => {
    await fetch("/api/youtube-channel-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId, ...body }),
    });
    fetchTopics();
  };

  const handleCreateTopic = async () => {
    if (!topicTitle.trim()) return;
    setSaving(true);
    await post({ action: "createTopic", title: topicTitle, description: topicDesc || undefined, previewImage: topicImage || undefined });
    setTopicTitle(""); setTopicDesc(""); setTopicImage(""); setShowTopicForm(false);
    setSaving(false);
  };

  const handleCreateVideo = async () => {
    if (!vidTopicId || !vidUrl.trim()) return;
    setSaving(true);
    await post({ action: "createVideo", topicId: vidTopicId, url: vidUrl.trim(), title: vidTitle || undefined, description: vidDesc || undefined });
    setVidUrl(""); setVidTitle(""); setVidDesc(""); setShowVideoForm(false);
    setSaving(false);
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Delete this topic and all its videos?")) return;
    await post({ action: "deleteTopic", topicId });
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Delete this video?")) return;
    await post({ action: "deleteVideo", videoId });
  };

  const handleTogglePin = async (topicId: string) => { await post({ action: "togglePin", topicId }); };

  const handleReorder = async (topicId: string, direction: "up" | "down") => {
    const idx = topics.findIndex(t => t.id === topicId);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === topics.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const order = topics.map((t, i) => {
      if (i === idx) return { id: topics[swapIdx].id, sort: i };
      if (i === swapIdx) return { id: topics[idx].id, sort: i };
      return { id: t.id, sort: i };
    });
    await post({ action: "reorder", order });
  };

  if (loading) return null;
  if (topics.length === 0 && !isOwner) return null;

  const pinnedTopics = topics.filter(t => t.pinned);
  const otherTopics = topics.filter(t => !t.pinned);
  const displayTopics = [...pinnedTopics, ...otherTopics].slice(0, 3);
  const shownTopics = expanded ? topics : displayTopics;

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold text-primary uppercase tracking-tight">Topics</h2>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button onClick={() => setShowTopicForm(!showTopicForm)} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">
              + New Topic
            </button>
            {topics.length > 0 && (
              <button onClick={() => { setShowVideoForm(!showVideoForm); if (!vidTopicId && topics.length > 0) setVidTopicId(topics[0].id); }} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">
                + Add Video
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
              type="text" value={topicTitle} onChange={e => setTopicTitle(e.target.value)}
              placeholder="Topic title (e.g. Dribbling Drills)" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent"
            />
            <textarea
              value={topicDesc} onChange={e => setTopicDesc(e.target.value)}
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
                <ImageUpload onUploaded={url => setTopicImage(url)} />
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateTopic} disabled={saving || !topicTitle.trim()} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Create Topic"}
              </button>
              <button onClick={() => setShowTopicForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* Add Video Form */}
        {isOwner && showVideoForm && topics.length > 0 && (
          <div className="bg-white rounded-xl p-4 space-y-3 border border-border">
            <p className="text-sm font-bold text-primary">Add Video</p>
            <select value={vidTopicId} onChange={e => setVidTopicId(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent">
              {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <input
              type="text" value={vidTitle} onChange={e => setVidTitle(e.target.value)}
              placeholder="Video title (optional)" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent"
            />
            <textarea
              value={vidDesc} onChange={e => setVidDesc(e.target.value)}
              placeholder="Description (optional)" rows={2} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent resize-none"
            />
            <input
              type="url" value={vidUrl} onChange={e => setVidUrl(e.target.value)}
              placeholder="Paste YouTube URL..." className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <button onClick={handleCreateVideo} disabled={saving || !vidUrl.trim()} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Add Video"}
              </button>
              <button onClick={() => setShowVideoForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {topics.length === 0 && isOwner && (
          <p className="text-sm text-muted text-center py-4">No topics yet. Create your first topic to start organizing videos.</p>
        )}

        {shownTopics.map(topic => (
          <a
            key={topic.id}
            href={`/youtube-channels/${channelSlug}/topics/${topic.slug || topic.id}`}
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
                  <span className="text-xs text-muted">{topic.videos.length} video{topic.videos.length !== 1 ? "s" : ""}</span>
                  <span className="text-sm font-semibold text-accent group-hover:text-accent-hover transition-colors">View Videos →</span>
                </div>
              </div>
              {isOwner && (
                <div className="flex flex-col gap-1 flex-shrink-0 items-center">
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); handleReorder(topic.id, "up"); }} className="text-muted hover:text-primary transition-colors p-0.5" title="Move up">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); handleReorder(topic.id, "down"); }} className="text-muted hover:text-primary transition-colors p-0.5" title="Move down">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); handleTogglePin(topic.id); }} className={`text-[10px] transition-colors ${topic.pinned ? "text-amber-600 font-semibold" : "text-muted hover:text-amber-600"}`}>
                    {topic.pinned ? "★" : "☆"}
                  </button>
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); handleDeleteTopic(topic.id); }} className="text-[10px] text-muted hover:text-red-500 transition-colors">✕</button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center w-12 sm:w-14 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
              <span className="text-white text-2xl font-light">&#8250;</span>
            </div>
          </a>
        ))}

        {topics.length > 0 && (
          <div className="flex items-center justify-center gap-4 pt-2">
            {!expanded && topics.length > (pinnedTopics.length > 0 ? pinnedTopics.length : 3) && (
              <button onClick={() => setExpanded(true)} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
                Show All {topics.length} Topics
              </button>
            )}
            <a href={`/youtube-channels/${channelSlug}/topics`} className="text-sm font-semibold text-primary hover:text-accent transition-colors">
              View All Topics →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
