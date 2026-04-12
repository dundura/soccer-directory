import { getPodcastBySlug, getPodcastTopics } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShareButtons } from "@/components/profile-ui";

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
  const topics = await getPodcastTopics(podcast.id);

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
          <div className="space-y-3">
            {topics.map((topic) => (
              <a
                key={topic.id}
                href={`/podcasts/${slug}/topics/${topic.slug || topic.id}`}
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
                </div>
                <div className="flex items-center justify-center w-12 sm:w-14 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
                  <span className="text-white text-2xl font-light">&#8250;</span>
                </div>
              </a>
            ))}
          </div>
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
