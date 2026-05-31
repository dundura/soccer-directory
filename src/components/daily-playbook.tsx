"use client";

import { useState, useEffect, useCallback } from "react";

type Item = {
  id: number;
  day: string;
  channel: string;
  task: string;
  details: string;
  platforms: string;
  time_est: string;
  done: boolean;
  sort_order: number;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CHANNEL_COLORS: Record<string, { bg: string; text: string }> = {
  "Social Media":    { bg: "#eff6ff", text: "#1d4ed8" },
  "Email Marketing": { bg: "#f0fdf4", text: "#15803d" },
  "Content / SEO":   { bg: "#faf5ff", text: "#7e22ce" },
  "Paid Ads":        { bg: "#fff7ed", text: "#c2410c" },
  "Partnerships":    { bg: "#f0f9ff", text: "#0369a1" },
  "Affiliate":       { bg: "#fdf4ff", text: "#a21caf" },
};

export function DailyPlaybook() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"active" | "completed">("active");
  const [completing, setCompleting] = useState<number | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/focus/playbook");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(id: number, done: boolean) {
    setCompleting(id);
    await fetch("/api/focus/playbook", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
    setItems(prev => prev.map(i => i.id === id ? { ...i, done } : i));
    setCompleting(null);
  }

  async function resetDay(day: string) {
    setResetting(day);
    const dayItems = items.filter(i => i.day === day && i.done);
    await Promise.all(dayItems.map(i =>
      fetch("/api/focus/playbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: i.id, done: false }),
      })
    ));
    setItems(prev => prev.map(i => i.day === day ? { ...i, done: false } : i));
    setResetting(null);
  }

  async function resetWeek() {
    setResetting("week");
    await fetch("/api/focus/playbook?reset=week", { method: "DELETE" });
    setItems(prev => prev.map(i => ({ ...i, done: false })));
    setResetting(null);
  }

  const active = items.filter(i => !i.done);
  const completed = items.filter(i => i.done);

  // Group by day
  const grouped = DAYS.map(day => ({
    day,
    items: (subTab === "active" ? active : completed).filter(i => i.day === day),
  })).filter(g => g.items.length > 0);

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "8px 20px", fontSize: 13,
    fontWeight: isActive ? 700 : 500,
    color: isActive ? "#0F3154" : "#94a3b8",
    background: "none", border: "none",
    borderBottom: isActive ? "2px solid #0F3154" : "2px solid transparent",
    marginBottom: -2, cursor: "pointer",
    fontFamily: "inherit", whiteSpace: "nowrap",
  });

  const totalTime = (dayItems: Item[]) => {
    const mins = dayItems.reduce((sum, i) => {
      const m = parseInt(i.time_est);
      return sum + (isNaN(m) ? 0 : m);
    }, 0);
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F3154", margin: "0 0 4px" }}>Daily Marketing Playbook</h2>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Repeatable weekly cadence · ~15 hrs/week · {active.length} remaining · {completed.length} done</p>
        </div>
        <button
          onClick={resetWeek}
          disabled={resetting === "week" || completed.length === 0}
          style={{ padding: "8px 16px", background: "none", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#64748b", cursor: completed.length === 0 ? "not-allowed" : "pointer", opacity: completed.length === 0 ? 0.5 : 1, fontFamily: "inherit", whiteSpace: "nowrap" }}
        >
          {resetting === "week" ? "Resetting..." : "↺ Reset Week"}
        </button>
      </div>

      {/* Sub-tabs */}
      <div style={{ borderBottom: "2px solid #E1E8EF", marginBottom: 20 }}>
        <button style={tabStyle(subTab === "active")} onClick={() => setSubTab("active")}>
          Active ({active.length})
        </button>
        <button style={tabStyle(subTab === "completed")} onClick={() => setSubTab("completed")}>
          Completed ({completed.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>Loading...</div>
      ) : grouped.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>
          {subTab === "active" ? "All tasks completed this week! 🎉" : "No completed tasks yet."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {grouped.map(({ day, items: dayItems }) => (
            <div key={day}>
              {/* Day header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F3154" }}>{day}</h3>
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{totalTime(dayItems)}</span>
                </div>
                {subTab === "active" && dayItems.some(i => !i.done) === false ? null : (
                  subTab === "completed" && dayItems.length > 0 ? (
                    <button
                      onClick={() => resetDay(day)}
                      disabled={resetting === day}
                      style={{ padding: "4px 12px", background: "none", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {resetting === day ? "..." : "↺ Reset day"}
                    </button>
                  ) : null
                )}
                {subTab === "active" && items.filter(i => i.day === day && i.done).length > 0 && (
                  <button
                    onClick={() => resetDay(day)}
                    disabled={resetting === day}
                    style={{ padding: "4px 12px", background: "none", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {resetting === day ? "..." : "↺ Reset day"}
                  </button>
                )}
              </div>

              {/* Tasks */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E1E8EF", overflow: "hidden" }}>
                {dayItems.map((item, idx) => {
                  const color = CHANNEL_COLORS[item.channel] || { bg: "#f8fafc", text: "#475569" };
                  return (
                    <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", borderBottom: idx < dayItems.length - 1 ? "1px solid #f1f5f9" : "none", background: item.done ? "#fafafa" : "#fff" }}>
                      {/* Channel badge */}
                      <div style={{ flexShrink: 0, paddingTop: 2 }}>
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: color.bg, color: color.text, whiteSpace: "nowrap" }}>
                          {item.channel}
                        </span>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: item.done ? "#94a3b8" : "#0F3154", textDecoration: item.done ? "line-through" : "none", marginBottom: 3 }}>
                          {item.task}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: 4 }}>{item.details}</div>
                        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#94a3b8" }}>
                          <span>📱 {item.platforms}</span>
                          <span>⏱ {item.time_est}</span>
                        </div>
                      </div>

                      {/* Action */}
                      <div style={{ flexShrink: 0 }}>
                        {!item.done ? (
                          <button
                            onClick={() => toggle(item.id, true)}
                            disabled={completing === item.id}
                            style={{ padding: "6px 14px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                          >
                            {completing === item.id ? "..." : "✓ Done"}
                          </button>
                        ) : (
                          <button
                            onClick={() => toggle(item.id, false)}
                            disabled={completing === item.id}
                            style={{ padding: "6px 14px", background: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                          >
                            {completing === item.id ? "..." : "↩ Undo"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
