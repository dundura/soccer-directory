import { getPodcastBySlug, getPodcastTopics, getListingOwnerIdById } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShareButtons } from "@/components/profile-ui";
import { TopicsReorderList } from "./TopicsReorderList";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) return {};
  return {
    title: `All Topics | ${podcast.name} | Soccer Near Me`,
    description: `Browse all topics and episodes from ${podcast.name}`,
  };
}

export default async function AllTopicsPage({ params }: Props) {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) notFound();
  const [topics, ownerId] = await Promise.all([
    getPodcastTopics(podcast.id),
    getListingOwnerIdById("podcast", podcast.id),
  ]);

  const pageUrl = `https://www.soccer-near-me.com/podcasts/${slug}/topics`;

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[900px] mx-auto px-6 py-3.5 text-sm text-muted">
        <a href="/podcasts" className="text-primary hover:underline">Podcasts</a>
        {" › "}
        <a href={`/podcasts/${slug}`} className="text-primary hover:underline">{podcast.name}</a>
        {" › "}
        <span>All Topics</span>
      </div>

      <div className="max-w-[900px] mx-auto px-6 pb-16">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 mb-6">
          <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase tracking-tight leading-tight mb-3">
            All Topics
          </h1>
          <p className="text-primary/70 text-base mb-4">
            {topics.length} topic{topics.length !== 1 ? "s" : ""} from <a href={`/podcasts/${slug}`} className="text-accent hover:underline">{podcast.name}</a>
          </p>
          <ShareButtons url={pageUrl} title={`All Topics | ${podcast.name}`} />
        </div>

        {/* Topics list */}
        {topics.length === 0 ? (
          <p className="text-muted text-center py-8">No topics yet.</p>
        ) : (
          <TopicsReorderList
            initialTopics={topics}
            podcastSlug={slug}
            podcastId={podcast.id}
            ownerId={ownerId ?? null}
          />
        )}

        {/* Back link */}
        <div className="mt-6 text-center">
          <a href={`/podcasts/${slug}`} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
            &larr; Back to {podcast.name}
          </a>
        </div>
      </div>
    </>
  );
}
