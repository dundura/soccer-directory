"use client";

import { useEffect, useState } from "react";

type Day = { day: string; done: boolean[]; complete: number };

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const pretty = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
};

export function AffirmationTracker() {
  const [items, setItems] = useState<string[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDay, setNewDay] = useState(todayISO());
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/focus/affirmations");
      const data = await res.json();
      if (data && data.items) { setItems(data.items); setDays(data.days || []); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addDay = async () => {
    setBusy(true);
    try {
      await fetch("/api/focus/affirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: newDay }),
      });
      await load();
    } finally { setBusy(false); }
  };

  const toggle = async (day: string, idx: number, next: boolean) => {
    // Move the tick first so it feels instant, then persist.
    setDays((prev) => prev.map((d) => {
      if (d.day !== day) return d;
      const done = d.done.slice();
      done[idx] = next;
      return { ...d, done, complete: done.filter(Boolean).length };
    }));
    await fetch("/api/focus/affirmations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, itemIdx: idx, done: next }),
    }).catch(() => load());
  };

  const removeDay = async (day: string) => {
    setBusy(true);
    try {
      await fetch(`/api/focus/affirmations?day=${day}`, { method: "DELETE" });
      await load();
    } finally { setBusy(false); }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#6B7D8E", fontSize: 14 }}>Loading…</div>;
  }

  const card: React.CSSProperties = {
    background: "#fff", border: "1px solid #E1E8EF", borderRadius: 14,
    boxShadow: "0 2px 10px rgba(15,49,84,0.06)",
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 56px" }}>

      {/* Add a day */}
      <div style={{ ...card, padding: 16, marginBottom: 18, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7D8E" }}>
          Add a day
        </span>
        <input
          type="date"
          value={newDay}
          onChange={(e) => setNewDay(e.target.value)}
          style={{
            padding: "9px 12px", borderRadius: 9, border: "1px solid #E1E8EF",
            fontSize: 14, fontFamily: "inherit", color: "#0F3154",
          }}
        />
        <button
          type="button"
          onClick={addDay}
          disabled={busy}
          style={{
            padding: "10px 20px", borderRadius: 9, border: "none", background: "#0F3154",
            color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: busy ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {busy ? "Saving…" : "Add"}
        </button>
      </div>

      {days.length === 0 && (
        <div style={{ ...card, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0F3154", marginBottom: 6 }}>No days yet</div>
          <div style={{ fontSize: 13.5, color: "#6B7D8E" }}>Add today above and start ticking.</div>
        </div>
      )}

      {days.map((d) => (
        <div key={d.day} style={{ ...card, padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: "#0F3154" }}>{pretty(d.day)}</div>
            <div style={{
              fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 999,
              background: d.complete === items.length ? "#DCFCE7" : "#F1F5F9",
              color: d.complete === items.length ? "#15803D" : "#6B7D8E",
            }}>
              {d.complete} of {items.length}
            </div>
            <button
              type="button"
              onClick={() => removeDay(d.day)}
              title="Remove this day"
              style={{
                marginLeft: "auto", border: "none", background: "none", cursor: "pointer",
                color: "#94A3B8", fontSize: 18, lineHeight: 1, fontFamily: "inherit",
              }}
            >×</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {items.map((label, i) => {
              const done = !!d.done[i];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(d.day, i, !done)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%",
                    padding: "11px 12px", border: "none", borderRadius: 10, cursor: "pointer",
                    background: done ? "#F0FDF4" : "transparent", textAlign: "left",
                    fontFamily: "inherit", transition: "background .15s ease",
                  }}
                >
                  {/* Radio: tap to tick, tap again to undo */}
                  <span
                    aria-hidden="true"
                    style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${done ? "#16A34A" : "#CBD5E1"}`,
                      background: done ? "#16A34A" : "#fff",
                      display: "grid", placeItems: "center",
                      color: "#fff", fontSize: 12, fontWeight: 900, lineHeight: 1,
                    }}
                  >{done ? "✓" : ""}</span>

                  <span style={{
                    fontSize: 14.5, fontWeight: done ? 600 : 500,
                    color: done ? "#16A34A" : "#0F3154",
                    textDecoration: done ? "line-through" : "none",
                    textDecorationColor: "#16A34A",
                    textDecorationThickness: 2,
                  }}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
