import { getPodcastBySlug, getPodcastEpisodeBySlug } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ClickableImage } from "@/components/clickable-image";
import { EpisodeLayout } from "./EpisodeLayout";

export const revalidate = 3600;

function getVideoThumbnail(url?: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    else if (url.includes("v=")) videoId = url.split("v=")[1]?.split("&")[0] || "";
    else if (url.includes("/embed/")) videoId = url.split("/embed/")[1]?.split("?")[0] || "";
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return null;
}

type Props = { params: Promise<{ slug: string; episodeSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, episodeSlug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) return {};
  const episode = await getPodcastEpisodeBySlug(episodeSlug);
  if (!episode) return {};
  const plainDesc = episode.description ? episode.description.replace(/<[^>]*>/g, '').slice(0, 200) : `${episode.title || "Episode"} from ${podcast.name}`;
  return {
    title: `${episode.title || "Episode"} | ${podcast.name} | Soccer Near Me`,
    description: plainDesc,
    openGraph: {
      title: `${episode.title || "Episode"} | ${podcast.name}`,
      description: plainDesc,
      images: episode.previewImage ? [episode.previewImage] : getVideoThumbnail(episode.embedUrl) ? [getVideoThumbnail(episode.embedUrl)!] : undefined,
    },
  };
}

export default async function EpisodePage({ params }: Props) {
  const { slug, episodeSlug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) notFound();
  const episode = await getPodcastEpisodeBySlug(episodeSlug);
  if (!episode) notFound();

  if (episode.slug && episodeSlug !== episode.slug) {
    const { redirect } = await import('next/navigation');
    redirect(`/podcasts/${slug}/episodes/${episode.slug}`);
  }

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
            <ClickableImage src={episode.previewImage} alt={episode.title || "Episode"} className="w-full max-h-[520px] object-contain cursor-zoom-in" />
          )}
          <div className="p-6 sm:p-8">
            <EpisodeLayout
              podcastSlug={slug}
              podcastName={podcast.name}
              episode={{
                title: episode.title,
                topicTitle: episode.topicTitle,
                description: episode.description,
                embedUrl: episode.embedUrl,
                embedHtml: episode.embedHtml,
                links: episode.links,
                slug: episode.slug,
                id: episode.id,
              }}
              pageUrl={pageUrl}
            />
          </div>
        </div>
      </div>
    </>
  );
}
