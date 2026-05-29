"use client";

import { useState, useEffect, useCallback } from "react";

interface Post {
  id: string;
  slug?: string;
  title?: string;
  body: string;
  imageUrl?: string;
  ogImageUrl?: string;
  videoUrl?: string;
  hidden: boolean;
  createdAt: string;
  listingType: string;
  listingId: string;
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "#fff", borderRadius: 14, border: "1px solid #E1E8EF",
  boxShadow: "0 2px 8px rgba(15,49,84,0.05)",
};
const btn = (bg: string, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  background: bg, color, border: "none", borderRadius: 8, padding: "7px 14px",
  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", ...extra,
});

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatType(type: string): string {
  const map: Record<string, string> = {
    trainingapp: "Training App", podcast: "Podcast", trainer: "Trainer",
    club: "Club", camp: "Camp", blog: "Blog", youtube: "YouTube",
  };
  return map[type] || type;
}

async function apiFetch(url: string, method = "GET", body?: object) {
  const res = await fetch(url, {
    method, headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

export function PostsHub() {
  const [posts, setPosts]           = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterText, setFilterText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch("/api/focus/posts");
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    await apiFetch("/api/listing-posts", "DELETE", { id: postId });
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleToggleHidden = async (postId: string) => {
    await apiFetch("/api/listing-posts", "PATCH", { id: postId, action: "toggle_hidden" });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, hidden: !p.hidden } : p));
  };

  // Unique listing types for filter
  const listingTypes = Array.from(new Set(posts.map(p => p.listingType))).sort();

  const filtered = posts.filter(p => {
    const typeMatch = !filterType || p.listingType === filterType;
    const textMatch = !filterText || (p.title || p.body).toLowerCase().includes(filterText.toLowerCase());
    return typeMatch && textMatch;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)", marginBottom: 4 }}>Our Posts</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{posts.length} post{posts.length !== 1 ? "s" : ""} across all listings</div>
        </div>
        <a
          href="/posts/new-post"
          style={{ ...btn("#0F3154", "#fff", { fontSize: 13, padding: "9px 18px", textDecoration: "none", display: "inline-block" }) }}
        >
          + New Post
        </a>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>Filter:</span>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ border: "1px solid #E1E8EF", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "#334155", cursor: "pointer" }}
        >
          <option value="">All listing types</option>
          {listingTypes.map(t => (
            <option key={t} value={t}>{formatType(t)}</option>
          ))}
        </select>
        <input
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          placeholder="Search posts…"
          style={{ border: "1px solid #E1E8EF", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "#0F3154", outline: "none", minWidth: 180 }}
        />
        {(filterType || filterText) && (
          <button onClick={() => { setFilterType(""); setFilterText(""); }}
            style={{ ...btn("#F1F5F9", "#64748b", { fontSize: 11 }) }}>Clear</button>
        )}
        <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>
          {filtered.length} of {posts.length} shown
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 40 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          {posts.length === 0
            ? "No posts yet — create your first one above."
            : "No posts match your filter."}
        </div>
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={th()}>Post</th>
                <th style={th()}>Listing</th>
                <th style={th()}>Status</th>
                <th style={th()}>Date</th>
                <th style={th()}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => {
                const plainBody = post.body.replace(/<[^>]*>/g, "").replace(/&[a-z#0-9]+;/gi, " ").trim();
                const excerpt = plainBody.length > 90 ? plainBody.slice(0, 87) + "…" : plainBody;
                return (
                  <tr key={post.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                    <td style={{ ...td(), maxWidth: 340 }}>
                      <a
                        href={`/posts/${post.slug || post.id}`}
                        target="_blank"
                        rel="noopener"
                        style={{ display: "block", textDecoration: "none" }}
                      >
                        {post.title && (
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#0F3154", marginBottom: 2, lineHeight: 1.3 }}>
                            {post.title}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {excerpt}
                        </div>
                      </a>
                    </td>
                    <td style={td()}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 10, background: "#EFF6FF", color: "#1d4ed8" }}>
                        {formatType(post.listingType)}
                      </span>
                    </td>
                    <td style={td()}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 10,
                        background: post.hidden ? "#FEF2F2" : "#F0FDF4",
                        color: post.hidden ? "#dc2626" : "#15803d",
                      }}>
                        {post.hidden ? "Hidden" : "Visible"}
                      </span>
                    </td>
                    <td style={{ ...td(), color: "#94a3b8", whiteSpace: "nowrap", fontSize: 12 }}>
                      {timeAgo(post.createdAt)}
                    </td>
                    <td style={{ ...td() }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleToggleHidden(post.id)}
                          title={post.hidden ? "Show" : "Hide"}
                          style={{ ...btn("#F1F5F9", "#64748b", { padding: "4px 9px", fontSize: 11 }) }}
                        >
                          {post.hidden ? "Show" : "Hide"}
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          style={{ ...btn("#FEF2F2", "#dc2626", { padding: "4px 8px", fontSize: 11 }) }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function th(extra?: React.CSSProperties): React.CSSProperties {
  return { padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", whiteSpace: "nowrap", ...extra };
}
function td(extra?: React.CSSProperties): React.CSSProperties {
  return { padding: "11px 14px", verticalAlign: "middle", fontSize: 13, color: "#334155", ...extra };
}
