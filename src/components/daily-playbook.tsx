"use client";

import { useState, useEffect, useCallback } from "react";

type Item = { id: number; text: string; notes: string | null; done: boolean };

export function DailyPlaybook() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"active" | "completed">("active");
  const [newText, setNewText] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [completing, setCompleting] = useState<number | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/focus/todos?key=playbook");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const active = items.filter(i => !i.done);
  const completed = items.filter(i => i.done);
  const visible = subTab === "active" ? active : completed;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;
    setAdding(true);
    const res = await fetch("/api/focus/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText.trim(), notes: newNotes.trim() || null, key: "playbook" }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems(prev => [...prev, item]);
      setNewText("");
      setNewNotes("");
    }
    setAdding(false);
  }

  async function handleComplete(id: number) {
    setCompleting(id);
    await fetch("/api/focus/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: true }),
    });
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: true } : i));
    setCompleting(null);
  }

  async function handleUncomplete(id: number) {
    setCompleting(id);
    await fetch("/api/focus/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: false }),
    });
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: false } : i));
    setCompleting(null);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/focus/todos?id=${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    color: active ? "#0F3154" : "#94a3b8",
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid #0F3154" : "2px solid transparent",
    marginBottom: -2,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 20px", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F3154", margin: "0 0 4px" }}>Daily Playbook</h2>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          {active.length} active · {completed.length} completed
        </p>
      </div>

      {/* Add item form */}
      <form onSubmit={handleAdd} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E1E8EF", padding: "16px 20px", marginBottom: 20 }}>
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder="Add a new task..."
          style={{ width: "100%", border: "none", outline: "none", fontSize: 14, color: "#0F3154", fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box" }}
        />
        <input
          value={newNotes}
          onChange={e => setNewNotes(e.target.value)}
          placeholder="Notes (optional)"
          style={{ width: "100%", border: "none", outline: "none", fontSize: 12, color: "#94a3b8", fontFamily: "inherit", marginBottom: 12, boxSizing: "border-box" }}
        />
        <button
          type="submit"
          disabled={adding || !newText.trim()}
          style={{ padding: "8px 20px", background: adding || !newText.trim() ? "#94a3b8" : "#0F3154", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: adding || !newText.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >
          {adding ? "Adding..." : "+ Add Task"}
        </button>
      </form>

      {/* Sub-tabs */}
      <div style={{ borderBottom: "2px solid #E1E8EF", marginBottom: 16 }}>
        <button style={tabStyle(subTab === "active")} onClick={() => setSubTab("active")}>
          Active ({active.length})
        </button>
        <button style={tabStyle(subTab === "completed")} onClick={() => setSubTab("completed")}>
          Completed ({completed.length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>Loading...</div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>
          {subTab === "active" ? "No active tasks. Add one above." : "No completed tasks yet."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visible.map(item => (
            <div key={item.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #E1E8EF", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              {/* Checkmark / done indicator */}
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                {item.done ? (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>
                  </div>
                ) : (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #E1E8EF" }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: item.done ? "#94a3b8" : "#0F3154", textDecoration: item.done ? "line-through" : "none" }}>
                  {item.text}
                </div>
                {item.notes && (
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{item.notes}</div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {!item.done ? (
                  <button
                    onClick={() => handleComplete(item.id)}
                    disabled={completing === item.id}
                    style={{ padding: "5px 12px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                  >
                    {completing === item.id ? "..." : "✓ Complete"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUncomplete(item.id)}
                    disabled={completing === item.id}
                    style={{ padding: "5px 12px", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                  >
                    {completing === item.id ? "..." : "↩ Undo"}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{ padding: "5px 8px", background: "none", color: "#cbd5e1", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit", lineHeight: 1 }}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
