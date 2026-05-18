"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import type { PodcastTopic } from "@/lib/db";

export function TopicsReorderList({
  initialTopics,
  podcastSlug,
  podcastId,
  ownerId,
}: {
  initialTopics: PodcastTopic[];
  podcastSlug: string;
  podcastId: string;
  ownerId: string | null;
}) {
  const { data: session } = useSession();
  const isOwner =
    !!(ownerId && session?.user?.id === ownerId) ||
    (session?.user as any)?.role === "admin";

  const [topics, setTopics] = useState(initialTopics);
  const [saving, setSaving] = useState(false);
  const dragId = useRef<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  const handleDragStart = (id: string) => {
    dragId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverId.current = id;
  };

  const handleDrop = async () => {
    if (!dragId.current || !dragOverId.current || dragId.current === dragOverId.current) return;

    const from = topics.findIndex((t) => t.id === dragId.current);
    const to = topics.findIndex((t) => t.id === dragOverId.current);
    if (from === -1 || to === -1) return;

    const reordered = [...topics];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setTopics(reordered);

    dragId.current = null;
    dragOverId.current = null;

    setSaving(true);
    try {
      await fetch("/api/podcast-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          podcastId,
          order: reordered.map((t, i) => ({ id: t.id, sort: i })),
        }),
      });
    } catch {}
    setSaving(false);
  };

  return (
    <>
      {isOwner && (
        <p className="text-xs text-muted mb-3 flex items-center gap-1.5">
          <span>⠿</span> Drag topics to reorder {saving && <span className="text-accent">— saving…</span>}
        </p>
      )}
      <div className="space-y-3">
        {topics.map((topic) => {
          const href = `/podcasts/${podcastSlug}/topics/${topic.slug || topic.id}`;
          return (
            <div
              key={topic.id}
              draggable={isOwner}
              onDragStart={() => handleDragStart(topic.id)}
              onDragOver={(e) => handleDragOver(e, topic.id)}
              onDrop={handleDrop}
              className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
              style={{ cursor: isOwner ? "grab" : undefined }}
            >
              {isOwner && (
                <div className="flex items-center justify-center w-8 flex-shrink-0 text-muted/40 text-lg select-none">
                  ⠿
                </div>
              )}
              <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />
              {topic.previewImage && (
                <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-surface">
                    <img src={topic.previewImage} alt={topic.title} className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
              <a href={href} className="flex-1 min-w-0 p-4 sm:p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight group-hover:text-accent transition-colors">
                    {topic.title}
                  </h3>
                  {topic.description && (
                    <p className="text-sm text-primary/70 mt-1 line-clamp-2">{topic.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted">
                      {topic.episodes.length} episode{topic.episodes.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-sm font-semibold text-accent group-hover:text-accent-hover transition-colors">
                      View Episodes →
                    </span>
                  </div>
                </div>
              </a>
              <a
                href={href}
                className="flex items-center justify-center w-12 sm:w-14 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl"
              >
                <span className="text-white text-2xl font-light">&#8250;</span>
              </a>
            </div>
          );
        })}
      </div>
    </>
  );
}
