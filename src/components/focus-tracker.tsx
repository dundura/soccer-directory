"use client";

import { useState, useEffect, useRef } from "react";

interface LogItem {
  name: string;
  secs: number;
  ts: string;
  ds: string;
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
  const [currentTask, setCurrentTask] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [log, setLog] = useState<LogItem[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startTime !== null) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startTime]);

  const startTask = () => {
    const name = taskInput.trim();
    if (!name) { inputRef.current?.focus(); return; }
    if (startTime !== null) finishTask();
    setCurrentTask(name);
    setStartTime(Date.now());
    setElapsed(0);
    setTaskInput("");
  };

  const finishTask = () => {
    if (startTime === null) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const now = new Date();
    const ts = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const ds = now.toLocaleDateString([], { month: "short", day: "numeric" });
    setLog(prev => [{ name: currentTask, secs, ts, ds }, ...prev]);
    setStartTime(null);
    setElapsed(0);
    setCurrentTask("");
  };

  const total = log.reduce((a, i) => a + i.secs, 0);
  const avg = log.length ? Math.round(total / log.length) : 0;

  return (
    <div style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)", maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>
      <style>{`
        .focus-pulse { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #DC373E; margin-right: 6px; animation: fpulse 1.5s infinite; vertical-align: middle; }
        @keyframes fpulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.5; transform:scale(0.8); } }
        .focus-log-item { animation: fslide 0.3s ease; }
        @keyframes fslide { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .focus-del-btn:hover { color: #DC373E !important; }
        .focus-start-btn:hover { background: #C42F36 !important; }
        .focus-done-btn:hover { background: #1A4268 !important; }
        .focus-clear-btn:hover { color: #DC373E !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7D8E", marginBottom: 4, fontWeight: 500 }}>Focus</div>
        <h1 style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 32, fontWeight: 700, color: "#0F3154", lineHeight: 1.15 }}>
          Track what <span style={{ color: "#DC373E" }}>matters.</span>
        </h1>
      </div>

      {/* Input */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7D8E", marginBottom: 8, display: "block", fontWeight: 600 }}>
          What are you working on?
        </label>
        <div style={{ display: "flex", border: "1px solid #E1E8EF", borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 1px 4px rgba(15,49,84,0.06)" }}>
          <input
            ref={inputRef}
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

      {/* Active Session */}
      {startTime !== null && (
        <div style={{ border: "1px solid #DC373E", borderRadius: 10, background: "#FEF2F2", padding: "20px 24px", marginBottom: 32, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#DC373E" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#DC373E", marginBottom: 6, fontWeight: 600 }}>
                <span className="focus-pulse" />In progress
              </div>
              <div style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 18, fontWeight: 600, color: "#0F3154", lineHeight: 1.3, maxWidth: 320 }}>{currentTask}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 38, fontWeight: 700, color: "#0F3154", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{fmt(elapsed)}</div>
              <div style={{ fontSize: 11, color: "#DC373E", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2, fontWeight: 600 }}>elapsed</div>
            </div>
          </div>
          <button
            onClick={finishTask}
            className="focus-done-btn"
            style={{ marginTop: 16, background: "#0F3154", color: "#fff", border: "none", padding: "9px 20px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", borderRadius: 8, transition: "background 0.15s" }}
          >
            ✓ Mark complete
          </button>
        </div>
      )}

      {/* Log */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #E1E8EF" }}>
          <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7D8E", fontWeight: 700 }}>Completed</span>
          <button onClick={() => setLog([])} className="focus-clear-btn" style={{ fontSize: 12, color: "#6B7D8E", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "color 0.15s" }}>
            Clear all
          </button>
        </div>

        {log.length === 0 ? (
          <div style={{ fontSize: 15, color: "#6B7D8E", textAlign: "center", padding: "48px 0" }}>
            Nothing logged yet — start a task above.
          </div>
        ) : (
          <>
            {log.map((item, i) => (
              <div key={i} className="focus-log-item" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "14px 0", borderBottom: "1px solid #E1E8EF", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#0F3154" }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#6B7D8E", marginTop: 2 }}>{item.ds}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#0F3154" }}>{fmtShort(item.secs)}</div>
                  <div style={{ fontSize: 11, color: "#6B7D8E", marginTop: 2 }}>done at {item.ts}</div>
                </div>
                <button
                  onClick={() => setLog(prev => prev.filter((_, idx) => idx !== i))}
                  className="focus-del-btn"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7D8E", fontSize: 18, lineHeight: 1, padding: "2px 4px", transition: "color 0.15s" }}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}

            <div style={{ marginTop: 24, background: "#ECF1F7", borderRadius: 10, padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, border: "1px solid #E1E8EF" }}>
              {[
                { label: "Total time", val: fmtShort(total) },
                { label: "Tasks done", val: String(log.length) },
                { label: "Avg per task", val: fmtShort(avg) },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7D8E", marginBottom: 4, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 22, fontWeight: 700, color: "#0F3154" }}>{s.val}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
