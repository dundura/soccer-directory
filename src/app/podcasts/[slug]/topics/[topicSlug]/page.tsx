import { getPodcastBySlug, getPodcastTopicBySlug, getListingOwner } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShareButtons } from "@/components/profile-ui";
import { PodcastTopicDetail } from "./topic-detail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; topicSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, topicSlug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) return {};
  const topic = await getPodcastTopicBySlug(podcast.id, topicSlug);
  if (!topic) return {};
  return {
    title: `${topic.title} | ${podcast.name} | Soccer Near Me`,
    description: topic.description || `${topic.title} - episodes and content from ${podcast.name}`,
    openGraph: {
      title: `${topic.title} | ${podcast.name}`,
      description: topic.description || `${topic.title} - episodes from ${podcast.name}`,
      images: topic.previewImage ? [topic.previewImage] : undefined,
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug, topicSlug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) notFound();
  const topic = await getPodcastTopicBySlug(podcast.id, topicSlug);
  if (!topic) notFound();
  const ownerId = await getListingOwner("podcast", slug);

  const pageUrl = `https://www.soccer-near-me.com/podcasts/${slug}/topics/${topicSlug}`;

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[900px] mx-auto px-6 py-3.5 text-sm text-muted">
        <a href="/podcasts" className="text-primary hover:underline">Podcasts</a>
        {" › "}
        <a href={`/podcasts/${slug}`} className="text-primary hover:underline">{podcast.name}</a>
        {" › "}
        <span>{topic.title}</span>
      </div>

      <div className="max-w-[900px] mx-auto px-6 pb-16">
        {/* Topic Header */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6">
          {topic.previewImage && (
            <a href={topic.previewImage} target="_blank" rel="noopener noreferrer">
              <img src={topic.previewImage} alt={topic.title} className="w-full h-[200px] sm:h-[280px] object-cover cursor-pointer hover:opacity-90 transition-opacity" />
            </a>
          )}
          <div className="p-6 sm:p-8">
            <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase tracking-tight leading-tight mb-3">
              {topic.title}
            </h1>
            {topic.description && (
              <p className="text-primary/70 text-base leading-relaxed mb-4">{topic.description}</p>
            )}
            <div className="flex items-center gap-3 text-sm text-muted mb-4">
              <span>{topic.episodes.length} episode{topic.episodes.length !== 1 ? "s" : ""}</span>
              <span>&middot;</span>
              <a href={`/podcasts/${slug}`} className="text-accent hover:underline">{podcast.name}</a>
            </div>
            <ShareButtons url={pageUrl} title={`${topic.title} | ${podcast.name}`} />
          </div>
        </div>

        {/* Episodes */}
        <PodcastTopicDetail topic={topic} podcastId={podcast.id} podcastSlug={slug} ownerId={ownerId} />
      </div>
    </>
  );
}
