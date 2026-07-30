"use client";

import { useEffect, useState } from "react";

type Day = { day: string; done: boolean[]; complete: number; percent: number };
type Summary = { tracked: number; average: number; perfect: number; streak: number; best: number };

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

export function ChoresTracker() {
  const [items, setItems] = useState<string[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [summary, setSummary] = useState<Summary>({ tracked: 0, average: 0, perfect: 0, streak: 0, best: 0 });
  const [loading, setLoading] = useState(true);
  const [newDay, setNewDay] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  // Which day is open for ticking. Everything else stays collapsed in history.
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [view, setView] = useState<"tracker" | "history">("tracker");

  const load = async () => {
    try {
      const res = await fetch("/api/focus/chores");
      const data = await res.json();
      if (data && data.items) {
        setItems(data.items);
        setDays(data.days || []);
        setSummary(data.summary || { tracked: 0, average: 0, perfect: 0, streak: 0, best: 0 });
        setOpenDay((cur) => cur || todayISO());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addDay = async () => {
    setBusy(true);
    try {
      await fetch("/api/focus/chores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: newDay }),
      });
      setOpenDay(newDay);
      await load();
    } finally { setBusy(false); }
  };

  const toggle = async (day: string, idx: number, next: boolean) => {
    // Move the tick first so it feels instant, then persist.
    setDays((prev) => prev.map((d) => {
      if (d.day !== day) return d;
      const done = d.done.slice();
      done[idx] = next;
      const complete = done.filter(Boolean).length;
      return { ...d, done, complete, percent: Math.round((complete / items.length) * 100) };
    }));
    await fetch("/api/focus/chores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, itemIdx: idx, done: next }),
    }).catch(() => load());
  };

  const removeDay = async (day: string) => {
    setBusy(true);
    try {
      await fetch(`/api/focus/chores?day=${day}`, { method: "DELETE" });
      await load();
    } finally { setBusy(false); }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#6B7D8E", fontSize: 14 }}>Loading…</div>;
  }

  const tone = (pct: number) =>
    pct === 100 ? { fg: "#15803D", bg: "#DCFCE7", bar: "#16A34A" }
    : pct >= 60 ? { fg: "#B45309", bg: "#FEF3C7", bar: "#F59E0B" }
    : { fg: "#B91C1C", bg: "#FEE2E2", bar: "#EF4444" };

  const today = days.find((d) => d.day === todayISO()) || null;

  const card: React.CSSProperties = {
    background: "#fff", border: "1px solid #E1E8EF", borderRadius: 14,
    boxShadow: "0 2px 10px rgba(15,49,84,0.06)",
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 56px" }}>

      {/* Today at a glance */}
      <div style={{
        ...card, padding: "20px 22px", marginBottom: 18,
        background: "linear-gradient(135deg,#0F3154,#1c4a7a)", border: "none", color: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
            {today ? "Today" : "No entry for today"}
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
            {summary.tracked} day{summary.tracked === 1 ? "" : "s"} tracked · {summary.average}% average · {summary.perfect} perfect
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 6 }}>
          <span style={{ fontSize: 46, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {today ? today.percent : 0}%
          </span>
          {today && (
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", fontWeight: 600, paddingBottom: 7 }}>
              {today.complete} of {items.length} done
            </span>
          )}
        </div>

        <div style={{ background: "rgba(255,255,255,0.16)", borderRadius: 9, height: 10, overflow: "hidden", marginTop: 14 }}>
          <div style={{
            width: `${today ? Math.max(today.percent, 2) : 2}%`, height: "100%", borderRadius: 9,
            background: today && today.percent === 100 ? "#22C55E" : "#F59E0B",
            transition: "width .35s ease",
          }} />
        </div>

        {/* Streak - perfect days back to back */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: summary.streak > 0 ? "rgba(245,158,11,0.22)" : "rgba(255,255,255,0.1)",
            border: `1px solid ${summary.streak > 0 ? "rgba(245,158,11,0.55)" : "rgba(255,255,255,0.18)"}`,
            borderRadius: 999, padding: "7px 14px",
          }}>
            <span style={{ fontSize: 16 }}>{summary.streak > 0 ? "🔥" : "🌟"}</span>
            <span style={{ fontSize: 14, fontWeight: 900 }}>
              {summary.streak} day{summary.streak === 1 ? "" : "s"}
            </span>
            <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.68)", fontWeight: 600 }}>
              {summary.streak > 0 ? "streak" : "no streak yet"}
            </span>
          </div>
          {summary.best > 0 && (
            <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
              best {summary.best} day{summary.best === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>


      {/* Tracker / History */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["tracker", "history"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            style={{
              padding: "9px 18px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit",
              fontSize: 13, fontWeight: 800,
              border: `1px solid ${view === v ? "#0F3154" : "#E1E8EF"}`,
              background: view === v ? "#0F3154" : "#fff",
              color: view === v ? "#fff" : "#0F3154",
            }}
          >
            {v === "tracker" ? "Tracker" : "History"}
          </button>
        ))}
      </div>

      {/* Add a day */}
      <div style={{ ...card, padding: 16, marginBottom: 18, display: view === "tracker" ? "flex" : "none", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
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

      {view === "tracker" && days.length === 0 && (
        <div style={{ ...card, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0F3154", marginBottom: 6 }}>No days yet</div>
          <div style={{ fontSize: 13.5, color: "#6B7D8E" }}>Add today above and start ticking.</div>
        </div>
      )}

      {view === "history" && days.length > 0 && (
        <div style={{ ...card, padding: "6px 8px", marginBottom: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: "#6B7D8E", padding: "10px 10px 8px" }}>
            History
          </div>
          {days.map((d) => (
            <button
              key={`h-${d.day}`}
              type="button"
              onClick={() => { setOpenDay(d.day); setView("tracker"); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%",
                padding: "10px 12px", border: "none", borderRadius: 9, cursor: "pointer",
                background: openDay === d.day ? "#F1F5F9" : "transparent",
                fontFamily: "inherit", textAlign: "left",
              }}
            >
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0F3154", minWidth: 108 }}>{pretty(d.day)}</span>
              <span style={{ flex: 1, height: 6, background: "#EEF2F7", borderRadius: 6, overflow: "hidden" }}>
                <span style={{ display: "block", width: `${Math.max(d.percent, 2)}%`, height: "100%", background: tone(d.percent).bar, borderRadius: 6 }} />
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: tone(d.percent).fg, minWidth: 42, textAlign: "right" }}>{d.percent}%</span>
            </button>
          ))}
        </div>
      )}

      {view === "tracker" && days.filter((d) => d.day === openDay).map((d) => (
        <div key={d.day} style={{ ...card, padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: "#0F3154" }}>{pretty(d.day)}</div>
            <div style={{
              fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 999,
              background: tone(d.percent).bg, color: tone(d.percent).fg,
            }}>
              {d.percent}% · {d.complete} of {items.length}
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
