import { getGuestPostBySlug, incrementGuestPostViewCount, getGuestPostComments } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AnytimeInlineCTA } from "@/components/ui";
import { GuestPostComments } from "./guest-post-comments";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getGuestPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Guest Player Posts | Soccer Near Me`,
    description: post.body.substring(0, 160),
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Looking for Players": "bg-blue-100 text-blue-700",
  "Looking for Team": "bg-green-100 text-green-700",
  "Tournament Guest Play": "bg-purple-100 text-purple-700",
  "Showcase Opportunity": "bg-orange-100 text-orange-700",
  General: "bg-gray-100 text-gray-600",
};

export default async function GuestPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getGuestPostBySlug(slug);
  if (!post) notFound();

  await incrementGuestPostViewCount(slug);
  const comments = await getGuestPostComments(post.id);

  return (
    <>
      <div className="bg-primary text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/guest-play/posts" className="text-white/50 text-sm hover:text-white transition-colors mb-3 inline-block">&larr; Back to Posts</a>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"}`}>
              {post.category}
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold">{post.title}</h1>
          <p className="text-white/50 text-sm mt-2">
            by {post.userName} &middot; {new Date(post.createdAt).toLocaleDateString()} &middot; {post.viewCount} views &middot; {post.commentCount} replies
          </p>
        </div>
      </div>

      <div className="bg-white min-h-[60vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Original Post */}
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8 mb-6">
          <p className="text-muted leading-relaxed whitespace-pre-line">{post.body}</p>
        </div>

        {/* Comments */}
        <GuestPostComments
          postId={post.id}
          postSlug={slug}
          postUserId={post.userId}
          initialComments={comments.map((c) => ({
            id: c.id,
            body: c.body,
            userId: c.userId,
            userName: c.userName,
            createdAt: c.createdAt,
          }))}
        />
      </div>
      </div>

      {/* Anytime Soccer Training Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnytimeInlineCTA />
      </div>
    </>
  );
}
