import { getForumTopicBySlug, incrementTopicViewCount, getForumComments } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ForumComments } from "./forum-comments";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getForumTopicBySlug(slug);
  if (!topic) return {};
  return {
    title: `${topic.title} | Community Forum | Soccer Near Me`,
    description: topic.body.substring(0, 160),
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  Recruiting: "bg-blue-100 text-blue-700",
  Tryouts: "bg-red-100 text-red-700",
  "League Talk": "bg-purple-100 text-purple-700",
  Training: "bg-green-100 text-green-700",
  General: "bg-gray-100 text-gray-600",
};

export default async function TopicDetailPage({ params }: Props) {
  const { slug } = await params;
  const topic = await getForumTopicBySlug(slug);
  if (!topic) notFound();

  await incrementTopicViewCount(slug);
  const comments = await getForumComments(topic.id);

  return (
    <>
      <div className="bg-primary text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/forum" className="text-white/50 text-sm hover:text-white transition-colors mb-3 inline-block">&larr; Back to Forum</a>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[topic.category] || "bg-gray-100 text-gray-600"}`}>
              {topic.category}
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold">{topic.title}</h1>
          <p className="text-white/50 text-sm mt-2">
            by {topic.userName} &middot; {new Date(topic.createdAt).toLocaleDateString()} &middot; {topic.viewCount} views &middot; {topic.commentCount} replies
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Original Post */}
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8 mb-6">
          <p className="text-muted leading-relaxed whitespace-pre-line">{topic.body}</p>
        </div>

        {/* Anytime Soccer Training CTA */}
        <div className="bg-primary rounded-2xl px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Supplement Team Training with 5,000+ Videos</h3>
            <p className="text-sm text-white/60">Structured follow-along sessions for any level.</p>
          </div>
          <a href="https://anytime-soccer.com" target="_blank" className="bg-[#DC373E] text-white px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap hover:bg-[#C42F36] transition-colors">
            Try It Free &rarr;
          </a>
        </div>

        {/* Comments */}
        <ForumComments
          topicId={topic.id}
          topicSlug={slug}
          topicUserId={topic.userId}
          initialComments={comments.map((c) => ({
            id: c.id,
            body: c.body,
            userId: c.userId,
            userName: c.userName,
            createdAt: c.createdAt,
          }))}
        />
      </div>
    </>
  );
}
