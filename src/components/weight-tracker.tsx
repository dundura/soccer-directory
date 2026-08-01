"use client";

import { useEffect, useState } from "react";

type Entry = { day: string; weight: number };
type Goal = { goalWeight: number | null; startWeight: number | null; targetDate: string | null };

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

/** Whole days from today to an ISO date. Negative once the date has passed. */
const daysUntil = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
};

const card = {
  background: "#fff",
  border: "1px solid #E1E8EF",
  borderRadius: 14,
};

export function WeightTracker() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goal, setGoal] = useState<Goal>({ goalWeight: null, startWeight: null, targetDate: null });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [day, setDay] = useState(todayISO());
  const [weight, setWeight] = useState("");

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalWeight, setGoalWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/focus/weight");
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setGoal(data.goal || { goalWeight: null, startWeight: null, targetDate: null });
    } catch {
      setError("Could not load your weight log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addEntry = async () => {
    setError("");
    const value = Number(weight);
    if (!Number.isFinite(value) || value <= 0) { setError("Enter a weight."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/focus/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, weight: value }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not save."); return; }
      setWeight("");
      await load();
    } catch {
      setError("Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const saveGoal = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/focus/weight", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalWeight: goalWeight === "" ? null : Number(goalWeight), targetDate: targetDate || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not save the goal."); return; }
      setEditingGoal(false);
      await load();
    } catch {
      setError("Could not save the goal.");
    } finally {
      setBusy(false);
    }
  };

  const removeEntry = async (d: string) => {
    if (!window.confirm(`Remove the reading for ${pretty(d)}?`)) return;
    setBusy(true);
    try {
      await fetch(`/api/focus/weight?day=${encodeURIComponent(d)}`, { method: "DELETE" });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const openGoalEditor = () => {
    setGoalWeight(goal.goalWeight === null ? "" : String(goal.goalWeight));
    setTargetDate(goal.targetDate || "");
    setEditingGoal(true);
  };

  // entries arrive newest first
  const current = entries.length ? entries[0].weight : null;
  const start = goal.startWeight ?? (entries.length ? entries[entries.length - 1].weight : null);
  const changed = current !== null && start !== null ? current - start : null;
  const toGo = current !== null && goal.goalWeight !== null ? current - goal.goalWeight : null;
  const left = goal.targetDate ? daysUntil(goal.targetDate) : null;

  // How far along, start -> goal. Only meaningful with both ends and a
  // direction; a goal equal to the start would divide by zero.
  const span = start !== null && goal.goalWeight !== null ? start - goal.goalWeight : null;
  const progress = span !== null && span !== 0 && changed !== null
    ? Math.max(0, Math.min(100, Math.round((-changed / span) * 100)))
    : null;

  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  const signed = (n: number) => `${n > 0 ? "+" : ""}${fmt(n)}`;

  if (loading) {
    return <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px", color: "#6B7D8E" }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* Summary */}
      <div style={{ background: "#0F3154", color: "#fff", borderRadius: 16, padding: "22px 24px", marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.62)" }}>
          Weight
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 46, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {current === null ? "--" : fmt(current)}
          </span>
          {changed !== null && changed !== 0 && (
            <span style={{ fontSize: 14, fontWeight: 700, paddingBottom: 8, color: changed < 0 ? "#4ADE80" : "#FCA5A5" }}>
              {signed(changed)} since you started
            </span>
          )}
        </div>

        {progress !== null && (
          <div style={{ background: "rgba(255,255,255,0.16)", borderRadius: 9, height: 10, overflow: "hidden", marginTop: 14 }}>
            <div style={{
              width: `${Math.max(progress, 2)}%`, height: "100%", borderRadius: 9,
              background: progress >= 100 ? "#22C55E" : "#F59E0B",
              transition: "width .35s ease",
            }} />
          </div>
        )}

        <div style={{ display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap", fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.72)" }}>
          <span>Start {start === null ? "--" : fmt(start)}</span>
          <span>Goal {goal.goalWeight === null ? "not set" : fmt(goal.goalWeight)}</span>
          {toGo !== null && <span>{toGo > 0 ? `${fmt(toGo)} to go` : "goal reached"}</span>}
          {left !== null && (
            <span>{left >= 0 ? `${left} day${left === 1 ? "" : "s"} left` : `${Math.abs(left)} day${Math.abs(left) === 1 ? "" : "s"} past target`}</span>
          )}
          <span>{entries.length} reading{entries.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Add a reading */}
      <div style={{ ...card, padding: 16, marginBottom: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7D8E" }}>
          Add a reading
        </span>
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #E1E8EF", fontSize: 14, fontFamily: "inherit", color: "#0F3154" }}
        />
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={weight}
          placeholder="Weight"
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addEntry(); }}
          style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #E1E8EF", fontSize: 14, fontFamily: "inherit", color: "#0F3154", width: 120 }}
        />
        <button
          type="button"
          onClick={addEntry}
          disabled={busy}
          style={{
            padding: "9px 18px", borderRadius: 9, border: "none", background: "#0F3154", color: "#fff",
            fontSize: 13, fontWeight: 800, cursor: busy ? "wait" : "pointer", fontFamily: "inherit",
          }}
        >
          Save
        </button>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>
          One reading per day — saving again corrects it.
        </span>
      </div>

      {/* Goal */}
      <div style={{ ...card, padding: 16, marginBottom: 22 }}>
        {!editingGoal ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7D8E" }}>
              Goal
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0F3154" }}>
              {goal.goalWeight === null ? "Not set" : fmt(goal.goalWeight)}
              {goal.targetDate ? ` by ${pretty(goal.targetDate)}` : ""}
            </span>
            <button
              type="button"
              onClick={openGoalEditor}
              style={{
                padding: "7px 14px", borderRadius: 9, border: "1px solid #E1E8EF", background: "#fff",
                color: "#0F3154", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {goal.goalWeight === null ? "Set a goal" : "Edit"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7D8E" }}>
              Goal
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={goalWeight}
              placeholder="Goal weight"
              onChange={(e) => setGoalWeight(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #E1E8EF", fontSize: 14, fontFamily: "inherit", color: "#0F3154", width: 140 }}
            />
            <span style={{ fontSize: 13, color: "#6B7D8E", fontWeight: 600 }}>by</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #E1E8EF", fontSize: 14, fontFamily: "inherit", color: "#0F3154" }}
            />
            <button
              type="button"
              onClick={saveGoal}
              disabled={busy}
              style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "#0F3154", color: "#fff", fontSize: 13, fontWeight: 800, cursor: busy ? "wait" : "pointer", fontFamily: "inherit" }}
            >
              Save goal
            </button>
            <button
              type="button"
              onClick={() => setEditingGoal(false)}
              style={{ padding: "9px 14px", borderRadius: 9, border: "1px solid #E1E8EF", background: "#fff", color: "#6B7D8E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* The log */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", textAlign: "left" }}>
                {["Date", "Weight", "Change", "To goal", ""].map((h, i) => (
                  <th key={h || i} style={{
                    padding: "12px 16px", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "#6B7D8E", borderBottom: "1px solid #E1E8EF",
                    textAlign: i === 0 ? "left" : i === 4 ? "right" : "left", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "28px 16px", textAlign: "center", color: "#94a3b8" }}>
                    No readings yet — add one above and it will show here.
                  </td>
                </tr>
              )}
              {entries.map((e, i) => {
                // entries are newest first, so the previous reading in time is
                // the next one along.
                const prev = entries[i + 1];
                const delta = prev ? e.weight - prev.weight : null;
                const gap = goal.goalWeight === null ? null : e.weight - goal.goalWeight;
                return (
                  <tr key={e.day} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "12px 16px", color: "#0F3154", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {pretty(e.day)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#0F3154", fontWeight: 800 }}>{fmt(e.weight)}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: delta === null ? "#94a3b8" : delta < 0 ? "#16A34A" : delta > 0 ? "#DC2626" : "#6B7D8E" }}>
                      {delta === null ? "--" : delta === 0 ? "0" : signed(delta)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6B7D8E", fontWeight: 600 }}>
                      {gap === null ? "--" : gap <= 0 ? "reached" : fmt(gap)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => removeEntry(e.day)}
                        disabled={busy}
                        style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
