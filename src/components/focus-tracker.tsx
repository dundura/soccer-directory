"use client";

import { useState, useEffect, useRef } from "react";

interface Subtask { name: string; done: boolean; }
interface LogItem {
  id?: number;
  name: string;
  secs: number;
  ts: string;
  ds: string;
  subtasks: Subtask[];
}

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h + ":" + pad(m) + ":" + pad(s);
}
function fmtShort(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return h + "h " + m + "m";
  if (m > 0) return m + "m " + s + "s";
  return s + "s";
}

export function FocusTracker() {
  const [taskInput, setTaskInput] = useState("");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [pendingSubtasks, setPendingSubtasks] = useState<Subtask[]>([]);
  const [currentTask, setCurrentTask] = useState("");
  const [activeSubtasks, setActiveSubtasks] = useState<Subtask[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [log, setLog] = useState<LogItem[]>([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/focus")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLog(data.map((row: { id: number; name: string; secs: number; ts: string; ds: string; subtasks: Subtask[] | null }) => ({
            id: row.id,
            name: row.name,
            secs: row.secs,
            ts: row.ts,
            ds: row.ds,
            subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
          })));
        }
        setLoadingLog(false);
      })
      .catch(() => setLoadingLog(false));
  }, []);

  useEffect(() => {
    if (startTime !== null) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startTime]);

  const addPendingSubtask = () => {
    const name = subtaskInput.trim();
    if (!name) return;
    setPendingSubtasks(prev => [...prev, { name, done: false }]);
    setSubtaskInput("");
    subtaskInputRef.current?.focus();
  };

  const startTask = () => {
    const name = taskInput.trim();
    if (!name) { taskInputRef.current?.focus(); return; }
    if (startTime !== null) finishTask();
    setCurrentTask(name);
    setActiveSubtasks(pendingSubtasks);
    setPendingSubtasks([]);
    setStartTime(Date.now());
    setElapsed(0);
    setTaskInput("");
  };

  const toggleActiveSubtask = (i: number) => {
    setActiveSubtasks(prev => prev.map((s, idx) => idx === i ? { ...s, done: !s.done } : s));
  };

  const finishTask = async () => {
    if (startTime === null) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const now = new Date();
    const ts = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const ds = now.toLocaleDateString([], { month: "short", day: "numeric" });
    const item: LogItem = { name: currentTask, secs, ts, ds, subtasks: activeSubtasks };
    setLog(prev => [item, ...prev]);
    setStartTime(null);
    setElapsed(0);
    setCurrentTask("");
    setActiveSubtasks([]);
    try {
      const res = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const saved = await res.json();
      if (saved.id) {
        setLog(prev => prev.map((l, i) => i === 0 ? { ...l, id: saved.id } : l));
      }
    } catch { /* silent */ }
  };

  const deleteItem = async (i: number) => {
    const item = log[i];
    setLog(prev => prev.filter((_, idx) => idx !== i));
    if (item.id) {
      fetch(`/api/focus?id=${item.id}`, { method: "DELETE" }).catch(() => {});
    }
  };

  const total = log.reduce((a, i) => a + i.secs, 0);
  const avg = log.length ? Math.round(total / log.length) : 0;

  return (
    <div style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
      <style>{`
        .focus-pulse { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #DC373E; margin-right: 6px; animation: fpulse 1.5s infinite; vertical-align: middle; }
        @keyframes fpulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.5; transform:scale(0.8); } }
        .focus-log-item { animation: fslide 0.3s ease; }
        @keyframes fslide { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .focus-del-btn:hover { color: #DC373E !important; }
        .focus-start-btn:hover { background: #C42F36 !important; }
        .focus-done-btn:hover { background: #1A4268 !important; }
        .focus-clear-btn:hover { color: #DC373E !important; }
        .focus-sub-add:hover { background: #ECF1F7 !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7D8E", marginBottom: 4, fontWeight: 500 }}>Focus</div>
        <h2 style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 26, fontWeight: 700, color: "#0F3154", lineHeight: 1.15, margin: 0 }}>
          Track what <span style={{ color: "#DC373E" }}>matters.</span>
        </h2>
      </div>

      {/* Task input */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7D8E", marginBottom: 8, display: "block", fontWeight: 600 }}>
          What are you working on?
        </label>
        <div style={{ display: "flex", border: "1px solid #E1E8EF", borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 1px 4px rgba(15,49,84,0.06)" }}>
          <input
            ref={taskInputRef}
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") startTask(); }}
            placeholder="e.g. Write quarterly report..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "13px 16px", fontFamily: "inherit", fontSize: 14, color: "#0F3154" }}
          />
          <button
            onClick={startTask}
            className="focus-start-btn"
            style={{ background: "#DC373E", border: "none", padding: "13px 22px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.15s" }}
          >
            ▶ Start
          </button>
        </div>
      </div>

      {/* Subtask input (before starting) */}
      {startTime === null && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <input
              ref={subtaskInputRef}
              value={subtaskInput}
              onChange={e => setSubtaskInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addPendingSubtask(); }}
              placeholder="Add a subtask (optional)..."
              style={{ flex: 1, border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 14px", fontFamily: "inherit", fontSize: 13, color: "#0F3154", outline: "none", background: "#fff" }}
            />
            <button
              onClick={addPendingSubtask}
              className="focus-sub-add"
              style={{ border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 14px", fontFamily: "inherit", fontSize: 13, color: "#6B7D8E", cursor: "pointer", background: "#fff", transition: "background 0.15s", whiteSpace: "nowrap" }}
            >
              + Add
            </button>
          </div>
          {pendingSubtasks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {pendingSubtasks.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", background: "#F8FAFC", borderRadius: 6, fontSize: 13, color: "#0F3154" }}>
                  <span style={{ flex: 1 }}>· {s.name}</span>
                  <button onClick={() => setPendingSubtasks(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7D8E", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active session */}
      {startTime !== null && (
        <div style={{ border: "1px solid #DC373E", borderRadius: 10, background: "#FEF2F2", padding: "20px 24px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#DC373E" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: activeSubtasks.length > 0 ? 14 : 0 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#DC373E", marginBottom: 6, fontWeight: 600 }}>
                <span className="focus-pulse" />In progress
              </div>
              <div style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 17, fontWeight: 600, color: "#0F3154", lineHeight: 1.3, maxWidth: 260 }}>{currentTask}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 34, fontWeight: 700, color: "#0F3154", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{fmt(elapsed)}</div>
              <div style={{ fontSize: 11, color: "#DC373E", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2, fontWeight: 600 }}>elapsed</div>
            </div>
          </div>
          {activeSubtasks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
              {activeSubtasks.map((s, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: s.done ? "#6B7D8E" : "#0F3154" }}>
                  <input type="checkbox" checked={s.done} onChange={() => toggleActiveSubtask(i)} style={{ accentColor: "#DC373E", width: 14, height: 14 }} />
                  <span style={{ textDecoration: s.done ? "line-through" : "none" }}>{s.name}</span>
                </label>
              ))}
            </div>
          )}
          <button
            onClick={finishTask}
            className="focus-done-btn"
            style={{ marginTop: 4, background: "#0F3154", color: "#fff", border: "none", padding: "9px 20px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", borderRadius: 8, transition: "background 0.15s" }}
          >
            ✓ Mark complete
          </button>
        </div>
      )}

      {/* Log */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #E1E8EF" }}>
          <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7D8E", fontWeight: 700 }}>Completed</span>
        </div>

        {loadingLog ? (
          <div style={{ fontSize: 14, color: "#6B7D8E", padding: "24px 0" }}>Loading...</div>
        ) : log.length === 0 ? (
          <div style={{ fontSize: 15, color: "#6B7D8E", textAlign: "center", padding: "40px 0" }}>
            Nothing logged yet — start a task above.
          </div>
        ) : (
          <>
            {log.map((item, i) => (
              <div key={item.id ?? i} className="focus-log-item" style={{ padding: "14px 0", borderBottom: "1px solid #E1E8EF" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#0F3154" }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#6B7D8E", marginTop: 2 }}>{item.ds}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#0F3154" }}>{fmtShort(item.secs)}</div>
                    <div style={{ fontSize: 11, color: "#6B7D8E", marginTop: 2 }}>done at {item.ts}</div>
                  </div>
                  <button
                    onClick={() => deleteItem(i)}
                    className="focus-del-btn"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7D8E", fontSize: 18, lineHeight: 1, padding: "2px 4px", transition: "color 0.15s" }}
                    title="Delete"
                  >×</button>
                </div>
                {item.subtasks && item.subtasks.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                    {item.subtasks.map((s, si) => (
                      <div key={si} style={{ fontSize: 12, color: s.done ? "#6B7D8E" : "#0F3154", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: s.done ? "#16a34a" : "#6B7D8E", fontSize: 10 }}>{s.done ? "✓" : "·"}</span>
                        <span style={{ textDecoration: s.done ? "line-through" : "none" }}>{s.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: 20, background: "#ECF1F7", borderRadius: 10, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, border: "1px solid #E1E8EF" }}>
              {[
                { label: "Total time", val: fmtShort(total) },
                { label: "Tasks done", val: String(log.length) },
                { label: "Avg per task", val: fmtShort(avg) },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7D8E", marginBottom: 4, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 20, fontWeight: 700, color: "#0F3154" }}>{s.val}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
