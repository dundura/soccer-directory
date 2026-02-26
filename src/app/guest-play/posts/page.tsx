"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  userName: string;
  viewCount: number;
  isPinned: boolean;
  commentCount: number;
  createdAt: string;
}

const CATEGORIES = ["All", "Looking for Players", "Looking for Team", "Tournament Guest Play", "Showcase Opportunity", "General"];

const CATEGORY_COLORS: Record<string, string> = {
  "Looking for Players": "bg-blue-100 text-blue-700",
  "Looking for Team": "bg-green-100 text-green-700",
  "Tournament Guest Play": "bg-purple-100 text-purple-700",
  "Showcase Opportunity": "bg-orange-100 text-orange-700",
  General: "bg-gray-100 text-gray-600",
};

export default function GuestPostsPage() {
  const { status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    setLoading(true);
    const url = activeCategory === "All" ? "/api/guest-play/posts" : `/api/guest-play/posts?category=${encodeURIComponent(activeCategory)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeCategory]);

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">Guest Player Posts</h1>
            <p className="text-white/60">Post and find guest play opportunities, team needs, and player availability</p>
          </div>
          <a
            href={status === "authenticated" ? "/guest-play/posts/new" : "/dashboard"}
            className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors text-sm whitespace-nowrap"
          >
            + Create Post
          </a>
        </div>
      </div>

      <div className="bg-white min-h-[60vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-muted hover:border-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <p className="text-muted">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <div className="text-5xl mb-4">&#9917;</div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">No posts yet</h3>
            <p className="text-muted mb-6">Be the first to post a guest play opportunity or request!</p>
            <a href={status === "authenticated" ? "/guest-play/posts/new" : "/dashboard"} className="px-8 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors inline-block">
              Create a Post
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <a
                key={post.id}
                href={`/guest-play/posts/${post.slug}`}
                className="block bg-white rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {post.isPinned && (
                        <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pinned</span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"}`}>
                        {post.category}
                      </span>
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] font-bold text-lg text-primary truncate">{post.title}</h3>
                    <p className="text-sm text-muted mt-1">
                      by {post.userName} &middot; {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-4 shrink-0 text-sm text-muted">
                    <div className="text-center">
                      <div className="font-bold text-primary">{post.commentCount}</div>
                      <div className="text-xs">replies</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-primary">{post.viewCount}</div>
                      <div className="text-xs">views</div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
