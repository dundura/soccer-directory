"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Topic {
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

const CATEGORIES = ["All", "Questions", "Club Feedback", "League Feedback", "Training", "College Recruiting", "Recommendation", "General"];

const CATEGORY_COLORS: Record<string, string> = {
  Questions: "bg-blue-100 text-blue-700",
  "Club Feedback": "bg-orange-100 text-orange-700",
  "League Feedback": "bg-purple-100 text-purple-700",
  Training: "bg-green-100 text-green-700",
  "College Recruiting": "bg-red-100 text-red-700",
  Recommendation: "bg-teal-100 text-teal-700",
  General: "bg-gray-100 text-gray-600",
};

export default function ForumPage() {
  const { status } = useSession();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    setLoading(true);
    const url = activeCategory === "All" ? "/api/forum/topics" : `/api/forum/topics?category=${encodeURIComponent(activeCategory)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setTopics(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeCategory]);

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">Community Forum</h1>
            <p className="text-white/60">Discuss youth soccer topics with the community</p>
          </div>
          <a
            href={status === "authenticated" ? "/forum/new" : "/dashboard"}
            className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors text-sm whitespace-nowrap"
          >
            + Start a Discussion
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

        {/* Topics */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <p className="text-muted">Loading discussions...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center">
            <div className="text-5xl mb-4">&#128172;</div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">No discussions yet</h3>
            <p className="text-muted mb-6">Be the first to start a conversation!</p>
            <a href={status === "authenticated" ? "/forum/new" : "/dashboard"} className="px-8 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors inline-block">
              Start a Discussion
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <a
                key={topic.id}
                href={`/forum/${topic.slug}`}
                className="block bg-white rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {topic.isPinned && (
                        <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pinned</span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[topic.category] || "bg-gray-100 text-gray-600"}`}>
                        {topic.category}
                      </span>
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] font-bold text-lg text-primary truncate">{topic.title}</h3>
                    <p className="text-sm text-muted mt-1">
                      by {topic.userName} &middot; {new Date(topic.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-4 shrink-0 text-sm text-muted">
                    <div className="text-center">
                      <div className="font-bold text-primary">{topic.commentCount}</div>
                      <div className="text-xs">replies</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-primary">{topic.viewCount}</div>
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
