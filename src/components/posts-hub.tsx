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
  posted: boolean;
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
  const [postTab, setPostTab]       = useState<"active" | "posted">("active");

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

  const handleTogglePosted = async (postId: string) => {
    await apiFetch("/api/listing-posts", "PATCH", { id: postId, action: "toggle_posted" });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, posted: !p.posted } : p));
  };

  // Unique listing types for filter
  const listingTypes = Array.from(new Set(posts.map(p => p.listingType))).sort();

  const tabPosts = posts.filter(p => postTab === "posted" ? p.posted : !p.posted);
  const filtered = tabPosts.filter(p => {
    const typeMatch = !filterType || p.listingType === filterType;
    const textMatch = !filterText || (p.title || p.body).toLowerCase().includes(filterText.toLowerCase());
    return typeMatch && textMatch;
  });

  const activeCount = posts.filter(p => !p.posted).length;
  const postedCount = posts.filter(p => p.posted).length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
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

      {/* Active / Posted tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #E1E8EF", marginBottom: 16 }}>
        {(["active", "posted"] as const).map(t => (
          <button key={t} onClick={() => setPostTab(t)} style={{
            padding: "8px 20px", fontSize: 13, fontWeight: postTab === t ? 700 : 500,
            color: postTab === t ? "#0F3154" : "#94a3b8",
            background: "none", border: "none",
            borderBottom: postTab === t ? "2px solid #0F3154" : "2px solid transparent",
            marginBottom: -2, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
          }}>
            {t === "active" ? `Active (${activeCount})` : `Posted (${postedCount})`}
          </button>
        ))}
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
          {filtered.length} of {tabPosts.length} shown
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 40 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          {tabPosts.length === 0
            ? postTab === "posted" ? "No posted posts yet." : "No active posts."
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
                          onClick={() => handleTogglePosted(post.id)}
                          title={post.posted ? "Move back to Active" : "Mark as Posted"}
                          style={{ ...btn(post.posted ? "#F0FDF4" : "#F1F5F9", post.posted ? "#15803d" : "#64748b", { padding: "4px 9px", fontSize: 11 }) }}
                        >
                          {post.posted ? "✓ Posted" : "Posted"}
                        </button>
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

// ── Podcast links table ───────────────────────────────────────────────────────

interface PodcastEpisode {
  id: number;
  title: string;
  url?: string;
  notes?: string;
  status: string;
  created_at: string;
}

const PODCAST_STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Draft:     { bg: "#F1F5F9", color: "#64748b" },
  Scheduled: { bg: "#FEF3C7", color: "#92400e" },
  Published: { bg: "#F0FDF4", color: "#15803d" },
};

export function PodcastSection() {
  const [episodes, setEpisodes]     = useState<PodcastEpisode[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [newTitle, setNewTitle]     = useState("");
  const [newUrl, setNewUrl]         = useState("");
  const [creating, setCreating]     = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editTitle, setEditTitle]   = useState("");
  const [editUrl, setEditUrl]       = useState("");
  const [editNotes, setEditNotes]   = useState("");
  const [editStatus, setEditStatus] = useState("Draft");
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch("/api/focus/podcast");
    setEpisodes(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createEpisode = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const created = await apiFetch("/api/focus/podcast", "POST", { title: newTitle.trim(), url: newUrl.trim() || undefined });
    setEpisodes(prev => [created, ...prev]);
    setNewTitle(""); setNewUrl(""); setShowForm(false); setCreating(false);
  };

  const startEdit = (ep: PodcastEpisode) => {
    setEditingId(ep.id);
    setEditTitle(ep.title);
    setEditUrl(ep.url || "");
    setEditNotes(ep.notes || "");
    setEditStatus(ep.status);
  };

  const saveEdit = async (id: number) => {
    setSaving(true);
    await apiFetch("/api/focus/podcast", "PATCH", { id, title: editTitle, url: editUrl || undefined, notes: editNotes || undefined, status: editStatus });
    setEpisodes(prev => prev.map(e => e.id === id ? { ...e, title: editTitle, url: editUrl || undefined, notes: editNotes || undefined, status: editStatus } : e));
    setEditingId(null); setSaving(false);
  };

  const deleteEpisode = async (id: number) => {
    if (!confirm("Delete this episode?")) return;
    await apiFetch("/api/focus/podcast", "DELETE", { id });
    setEpisodes(prev => prev.filter(e => e.id !== id));
  };

  const wireEmail = async (ep: PodcastEpisode) => {
    // Create a newsletter draft pre-filled with the episode title + link
    const title = `Podcast: ${ep.title}`;
    const created = await apiFetch("/api/focus/newsletters", "POST", { title, subject: ep.title, status: "Draft" });
    if (created?.id) {
      // Add a link entry with the episode URL
      if (ep.url) {
        await apiFetch("/api/focus/newsletters/entries", "POST", {
          newsletter_id: created.id, type: "cta", content: `Listen Now | ${ep.url}`, sort_order: 0,
        });
      }
      // Switch to newsletter tab so they can see it
      sessionStorage.setItem("focusMainTab", "newsletter");
      window.location.reload();
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)" }}>🎙️ Podcast</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{episodes.length} episode{episodes.length !== 1 ? "s" : ""}</div>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{ ...btn("#0F3154", "#fff", { fontSize: 12, padding: "8px 16px" }) }}>
          {showForm ? "Cancel" : "+ New Episode"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{ ...card, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createEpisode()}
              placeholder="Episode title…"
              style={{ border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 12px", fontSize: 14, fontWeight: 600, color: "#0F3154", outline: "none" }}
            />
            <input
              value={newUrl} onChange={e => setNewUrl(e.target.value)}
              placeholder="Episode URL (optional)"
              style={{ border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#334155", outline: "none" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={createEpisode} disabled={creating || !newTitle.trim()}
                style={{ ...btn("#0F3154", "#fff"), opacity: (creating || !newTitle.trim()) ? 0.5 : 1 }}>
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ fontSize: 13, color: "#94a3b8", padding: 20 }}>Loading…</div>
      ) : episodes.length === 0 ? (
        <div style={{ ...card, padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          No episodes yet — add your first one above.
        </div>
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={th()}>Episode</th>
                <th style={th()}>Status</th>
                <th style={th()}>Date</th>
                <th style={th()}></th>
              </tr>
            </thead>
            <tbody>
              {episodes.map(ep => (
                <tr key={ep.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                  {editingId === ep.id ? (
                    // Inline edit row
                    <td colSpan={4} style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                          style={{ border: "1px solid #E1E8EF", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontWeight: 700, color: "#0F3154", outline: "none" }} />
                        <input value={editUrl} onChange={e => setEditUrl(e.target.value)}
                          placeholder="Episode URL"
                          style={{ border: "1px solid #E1E8EF", borderRadius: 8, padding: "7px 10px", fontSize: 13, color: "#334155", outline: "none" }} />
                        <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)}
                          placeholder="Notes…" rows={2}
                          style={{ border: "1px solid #E1E8EF", borderRadius: 8, padding: "7px 10px", fontSize: 12, color: "#334155", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                            style={{ border: "1px solid #E1E8EF", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
                            {["Draft", "Scheduled", "Published"].map(s => <option key={s}>{s}</option>)}
                          </select>
                          <button onClick={() => saveEdit(ep.id)} disabled={saving}
                            style={{ ...btn("#0F3154", "#fff", { fontSize: 12, padding: "6px 14px" }), opacity: saving ? 0.6 : 1 }}>
                            {saving ? "Saving…" : "Save"}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{ ...btn("#F1F5F9", "#64748b", { fontSize: 12, padding: "6px 14px" }) }}>Cancel</button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td style={{ ...td(), maxWidth: 320, cursor: "pointer" }} onClick={() => startEdit(ep)}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0F3154", marginBottom: ep.url || ep.notes ? 3 : 0 }}>{ep.title}</div>
                        {ep.url && (
                          <a href={ep.url} target="_blank" rel="noopener"
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: 11, color: "#DC373E", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>
                            {ep.url}
                          </a>
                        )}
                        {ep.notes && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{ep.notes}</div>}
                      </td>
                      <td style={td()}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 10,
                          background: PODCAST_STATUS_COLOR[ep.status]?.bg || "#F1F5F9",
                          color: PODCAST_STATUS_COLOR[ep.status]?.color || "#64748b",
                        }}>{ep.status}</span>
                      </td>
                      <td style={{ ...td(), color: "#94a3b8", whiteSpace: "nowrap", fontSize: 12 }}>
                        {new Date(ep.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td style={td()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => wireEmail(ep)}
                            title="Create newsletter draft for this episode"
                            style={{ ...btn("#EFF6FF", "#1d4ed8", { padding: "4px 9px", fontSize: 11 }) }}>
                            ✉️ Email
                          </button>
                          <button onClick={() => startEdit(ep)}
                            style={{ ...btn("#F1F5F9", "#64748b", { padding: "4px 9px", fontSize: 11 }) }}>Edit</button>
                          <button onClick={() => deleteEpisode(ep.id)}
                            style={{ ...btn("#FEF2F2", "#dc2626", { padding: "4px 8px", fontSize: 11 }) }}>Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
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
