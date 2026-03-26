import { getPodcastBySlug, getPodcastEpisodeBySlug } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShareButtons } from "@/components/profile-ui";
import { VideoEmbed } from "@/components/profile-ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; episodeSlug: string }> };

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, episodeSlug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) return {};
  const episode = await getPodcastEpisodeBySlug(episodeSlug);
  if (!episode) return {};
  return {
    title: `${episode.title || "Episode"} | ${podcast.name} | Soccer Near Me`,
    description: episode.description || `${episode.title || "Episode"} from ${podcast.name}`,
    openGraph: {
      title: `${episode.title || "Episode"} | ${podcast.name}`,
      description: episode.description || `${episode.title || "Episode"} from ${podcast.name}`,
      images: episode.previewImage ? [episode.previewImage] : undefined,
    },
  };
}

export default async function EpisodePage({ params }: Props) {
  const { slug, episodeSlug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) notFound();
  const episode = await getPodcastEpisodeBySlug(episodeSlug);
  if (!episode) notFound();

  const pageUrl = `https://www.soccer-near-me.com/podcasts/${slug}/episodes/${episode.slug || episode.id}`;

  return (
    <>
      <div className="max-w-[900px] mx-auto px-6 py-3.5 text-sm text-muted">
        <a href="/podcasts" className="text-primary hover:underline">Podcasts</a>
        {" › "}
        <a href={`/podcasts/${slug}`} className="text-primary hover:underline">{podcast.name}</a>
        {" › "}
        <span>{episode.topicTitle}</span>
        {" › "}
        <span>{episode.title || "Episode"}</span>
      </div>

      <div className="max-w-[900px] mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {episode.previewImage && (
            <img src={episode.previewImage} alt={episode.title || "Episode"} className="w-full h-[220px] sm:h-[300px] object-cover" />
          )}
          <div className="p-6 sm:p-8">
            <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase tracking-tight leading-tight mb-3">
              {episode.title || "Episode"}
            </h1>
            <p className="text-sm text-muted mb-4">
              From <a href={`/podcasts/${slug}`} className="text-accent hover:underline">{podcast.name}</a>
              {" · "}
              Topic: {episode.topicTitle}
            </p>
            {episode.description && (
              <p className="text-primary leading-relaxed whitespace-pre-line mb-6">{episode.description}</p>
            )}

            <div className="mb-6">
              <EmbedPlayer embedUrl={episode.embedUrl} embedHtml={episode.embedHtml} />
            </div>

            <ShareButtons url={pageUrl} title={`${episode.title || "Episode"} | ${podcast.name}`} />

            <div className="mt-6 pt-4 border-t border-border">
              <a href={`/podcasts/${slug}`} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
                &larr; Back to {podcast.name}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
