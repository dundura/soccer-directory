"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  body: string;
  userId: string;
  userName: string;
  createdAt: string;
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export function ForumComments({
  topicId,
  topicSlug,
  topicUserId,
  initialComments,
}: {
  topicId: string;
  topicSlug: string;
  topicUserId: string;
  initialComments: Comment[];
}) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingTopic, setDeletingTopic] = useState(false);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reported, setReported] = useState<Set<string>>(new Set());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/forum/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setComments((prev) => [
        ...prev,
        { id: json.id, body, userId: session?.user?.id || "", userName: json.userName || session?.user?.name || "You", createdAt: new Date().toISOString() },
      ]);
      setBody("");
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  async function handleDeleteComment(id: string) {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/forum/comments/${id}`, { method: "DELETE" });
      if (res.ok) setComments((prev) => prev.filter((c) => c.id !== id));
    } catch { /* ignore */ }
  }

  async function handleDeleteTopic() {
    if (!confirm("Delete this topic and all its comments?")) return;
    setDeletingTopic(true);
    try {
      const res = await fetch(`/api/forum/topics/${topicSlug}`, { method: "DELETE" });
      if (res.ok) window.location.href = "/forum";
    } catch { /* ignore */ }
    setDeletingTopic(false);
  }

  async function handleReport(commentId: string, commentBody: string) {
    setReportingId(commentId);
    try {
      await fetch("/api/forum/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, commentBody, topicSlug, reason: "Reported by user" }),
      });
      setReported((prev) => new Set(prev).add(commentId));
    } catch { /* ignore */ }
    setReportingId(null);
  }

  return (
    <div>
      {/* Topic owner actions */}
      {session?.user?.id === topicUserId && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDeleteTopic}
            disabled={deletingTopic}
            className="px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deletingTopic ? "Deleting..." : "Delete Topic"}
          </button>
        </div>
      )}

      <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mb-4">
        Comments ({comments.length})
      </h3>

      {comments.length > 0 ? (
        <div className="space-y-3 mb-6">
          {comments.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-primary">{c.userName}</span>
                  <span className="text-xs text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {session?.user?.id === c.userId && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  )}
                  {reported.has(c.id) ? (
                    <span className="text-xs text-muted">Reported</span>
                  ) : (
                    <button
                      onClick={() => handleReport(c.id, c.body)}
                      disabled={reportingId === c.id}
                      className="text-xs text-muted hover:text-red-500 font-medium"
                    >
                      Report
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{c.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted mb-6">No comments yet. Be the first to join the discussion!</p>
      )}

      {/* Comment Form */}
      {status === "authenticated" ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-5">
          <h4 className="text-sm font-bold text-primary mb-3">Add a Comment</h4>
          <textarea
            required
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts..."
            className={inputClass + " resize-none mb-3"}
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-2xl border border-border p-5 text-center">
          <p className="text-muted text-sm mb-3">Join the discussion</p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-colors"
          >
            Log In to Comment
          </a>
        </div>
      )}
    </div>
  );
}
