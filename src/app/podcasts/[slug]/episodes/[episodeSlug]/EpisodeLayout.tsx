"use client";

import { useState } from "react";
import { ShareButtons, VideoEmbed } from "@/components/profile-ui";

function EmbedPlayer({ embedUrl, embedHtml }: { embedUrl?: string; embedHtml?: string }) {
  if (embedHtml) {
    return <div className="rounded-lg overflow-hidden" dangerouslySetInnerHTML={{ __html: embedHtml }} />;
  }
  if (!embedUrl) return null;
  if (embedUrl.includes("spotify.com")) {
    const src = embedUrl.includes("/embed/") ? embedUrl : embedUrl.replace("spotify.com/episode/", "spotify.com/embed/episode/").replace("spotify.com/show/", "spotify.com/embed/show/");
    return <iframe src={src} width="100%" height="232" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-lg" />;
  }
  if (embedUrl.includes("podcasts.apple.com")) {
    return <iframe src={embedUrl.replace("podcasts.apple.com", "embed.podcasts.apple.com")} width="100%" height="175" frameBorder="0" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation" allow="autoplay *; encrypted-media *; clipboard-write" className="rounded-lg" />;
  }
  if (embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be")) {
    return <VideoEmbed url={embedUrl} />;
  }
  return <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-accent font-semibold hover:underline">Listen →</a>;
}

type Link = { url: string; label: string };

interface Props {
  podcastSlug: string;
  podcastName: string;
  episode: {
    title?: string;
    topicTitle?: string;
    description?: string;
    embedUrl?: string;
    embedHtml?: string;
    links?: Link[];
    slug?: string;
    id?: string | number;
  };
  pageUrl: string;
}

export function EpisodeLayout({ podcastSlug, podcastName, episode, pageUrl }: Props) {
  const [videoOnTop, setVideoOnTop] = useState(false);

  const hasEmbed = !!(episode.embedUrl || episode.embedHtml);

  const videoBlock = hasEmbed ? (
    <div className="mb-6">
      <EmbedPlayer embedUrl={episode.embedUrl} embedHtml={episode.embedHtml} />
    </div>
  ) : null;

  const textBlock = (
    <>
      {episode.description && (
        episode.description.includes("<") ?
          <div className="text-primary leading-relaxed mb-6 prose prose-sm max-w-none [&_a]:text-[#DC373E] [&_a]:underline [&_a]:font-semibold [&_p]:mb-3 [&_p:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: episode.description }} /> :
          <p className="text-primary leading-relaxed whitespace-pre-line mb-6">{episode.description}</p>
      )}
      {episode.links && episode.links.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {episode.links.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-colors">
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase tracking-tight leading-tight mb-3">
        {episode.title || "Episode"}
      </h1>
      <p className="text-sm text-muted mb-4">
        From <a href={`/podcasts/${podcastSlug}`} className="text-accent hover:underline">{podcastName}</a>
        {" · "}
        Topic: {episode.topicTitle}
      </p>

      {hasEmbed && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setVideoOnTop(v => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary border border-border rounded-full px-3 py-1.5 transition-colors"
          >
            {videoOnTop ? "▼ Move video below text" : "▲ Move video above text"}
          </button>
        </div>
      )}

      {videoOnTop && videoBlock}
      {textBlock}
      {!videoOnTop && videoBlock}

      <ShareButtons url={pageUrl} title={`${episode.title || "Episode"} | ${podcastName}`} />

      <div className="mt-6 pt-4 border-t border-border">
        <a href={`/podcasts/${podcastSlug}`} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
          &larr; Back to {podcastName}
        </a>
      </div>
    </>
  );
}
