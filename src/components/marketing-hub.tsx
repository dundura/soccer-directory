"use client";

import { useState, useEffect } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { BlogCalendar } from "@/components/blog-calendar";
import type {
  ActionStatus, Action12Row, MilestoneTrackerRow,
} from "@/components/marketing-data";
import {
  DAILY_TASKS, MONTHLY_PLAN, ANNUAL_CALENDAR, ACTION_PLAN,
  WEEKLY_TASKS, MILESTONES, REVENUE_MODEL, ACTION_PLAN_12, MILESTONE_TRACKER,
} from "@/components/marketing-data";

// ── Types ─────────────────────────────────────────────────────────────────────
type MTab = "blog" | "daily" | "plan12" | "tracker" | "monthly" | "annual" | "roadmap" | "weekly" | "revenue";

const M_TABS: { id: MTab; label: string }[] = [
  { id: "blog",    label: "Blog Calendar" },
  { id: "daily",   label: "Daily Playbook" },
  { id: "plan12",  label: "12-Mo Action Plan" },
  { id: "tracker", label: "Milestone Tracker" },
  { id: "monthly", label: "Monthly Campaign" },
  { id: "annual",  label: "Annual Calendar" },
  { id: "roadmap", label: "18-Mo Roadmap" },
  { id: "weekly",  label: "Weekly Tasks" },
  { id: "revenue", label: "Revenue Model" },
];

// ── Style helpers ─────────────────────────────────────────────────────────────
const thStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  padding: "9px 12px", textAlign: "left", fontSize: 10, fontWeight: 700,
  color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em",
  borderBottom: "1px solid #E1E8EF", whiteSpace: "nowrap", ...extra,
});
const tdStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  padding: "9px 12px", verticalAlign: "top", fontSize: 12, color: "#334155",
  borderTop: "1px solid #F1F5F9", ...extra,
});
const tableWrap: React.CSSProperties = {
  background: "#fff", borderRadius: 14, border: "1px solid #E1E8EF",
  boxShadow: "0 2px 8px rgba(15,49,84,0.05)", overflow: "hidden",
};
const badge = (bg: string, color: string, text: string) => (
  <span style={{ fontSize: 10, fontWeight: 700, background: bg, color, padding: "2px 7px", borderRadius: 10, whiteSpace: "nowrap" }}>{text}</span>
);

const DAY_COLOR: Record<string, string> = {
  Monday: "#2563eb", Tuesday: "#7c3aed", Wednesday: "#059669",
  Thursday: "#d97706", Friday: "#dc2626", Saturday: "#0891b2", Sunday: "#6b7280",
};
const CHANNEL_COLOR: Record<string, string> = {
  "Social Media": "#c026d3", "Email Marketing": "#2563eb", "Content / SEO": "#059669",
  "Paid Ads": "#ea580c", "Partnerships": "#7c3aed", "Affiliate": "#e11d48",
  "PR / Outreach": "#0f766e", "Tournament": "#92400e", "Brand / UX": "#0F3154",
  "All Channels": "#475569",
};
const PHASE_COLOR: Record<string, { bg: string; color: string }> = {
  "Phase 1: Foundation": { bg: "#EFF6FF", color: "#1d4ed8" },
  "Phase 2: Scale":      { bg: "#F0FDF4", color: "#15803d" },
  "Phase 3: Optimize":   { bg: "#FDF4FF", color: "#7e22ce" },
};
const STATUS_OPTIONS: ActionStatus[] = ["Not Started", "In Progress", "Done", "Paused"];
const STATUS_STYLE: Record<ActionStatus, { bg: string; color: string }> = {
  "Not Started": { bg: "#F1F5F9", color: "#64748b" },
  "In Progress": { bg: "#EFF6FF", color: "#1d4ed8" },
  "Done":        { bg: "#F0FDF4", color: "#15803d" },
  "Paused":      { bg: "#FEF3C7", color: "#92400e" },
};

// ── Sub-Components ────────────────────────────────────────────────────────────

function DailyPlaybook() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)", marginBottom: 4 }}>Daily Marketing Playbook</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Repeatable weekly cadence · ~15 hrs/week</div>
      {days.map(day => {
        const tasks = DAILY_TASKS.filter(t => t.day === day);
        const dc = DAY_COLOR[day];
        return (
          <div key={day} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: dc, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: dc, display: "inline-block" }} />
              {day}
            </div>
            <div style={tableWrap}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th style={thStyle({ width: 120 })}>Channel</th>
                    <th style={thStyle({ width: 200 })}>Task</th>
                    <th style={thStyle({})}>Details</th>
                    <th style={thStyle({ width: 140 })}>Platforms</th>
                    <th style={thStyle({ width: 60 })}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t, i) => {
                    const cc = CHANNEL_COLOR[t.channel] ?? "#94a3b8";
                    return (
                      <tr key={i}>
                        <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined })}>
                          {badge(cc + "15", cc, t.channel)}
                        </td>
                        <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 600, color: "#0F3154" })}>
                          {t.link ? (
                            <a href={t.link} target="_blank" rel="noopener noreferrer" style={{ color: "#0F3154", textDecoration: "none" }}
                              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                              {t.task} ↗
                            </a>
                          ) : t.task}
                        </td>
                        <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{t.details}</td>
                        <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b", fontSize: 11 })}>{t.platforms}</td>
                        <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#0F3154", whiteSpace: "nowrap" })}>{t.timeEst}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActionPlan12() {
  const [statuses, setStatuses] = usePersistedState<Record<number, ActionStatus>>("mkt_plan12_status", {});
  const cycleStatus = (id: number) => {
    const cur = statuses[id] ?? "Not Started";
    const next = STATUS_OPTIONS[(STATUS_OPTIONS.indexOf(cur) + 1) % STATUS_OPTIONS.length];
    setStatuses({ ...statuses, [id]: next });
  };

  const phases = ["Phase 1: Foundation", "Phase 2: Scale", "Phase 3: Optimize"];
  const doneCount = Object.values(statuses).filter(s => s === "Done").length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)", marginBottom: 4 }}>12-Month Action Plan</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
        <span style={{ color: "#16a34a", fontWeight: 700 }}>{doneCount}</span> of {ACTION_PLAN_12.length} complete · Click status badges to cycle
      </div>
      {phases.map(phase => {
        const rows = ACTION_PLAN_12.filter(r => r.phase === phase);
        const ps = PHASE_COLOR[phase];
        return (
          <div key={phase} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: ps.color, background: ps.bg, display: "inline-block", padding: "4px 14px", borderRadius: 20, marginBottom: 10 }}>{phase}</div>
            <div style={tableWrap}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th style={thStyle({ width: 90 })}>Category</th>
                    <th style={thStyle({ width: 200 })}>Initiative</th>
                    <th style={thStyle({})}>Specific Action</th>
                    <th style={thStyle({ width: 160 })}>Success Metric</th>
                    <th style={thStyle({ width: 70 })}>Timing</th>
                    <th style={thStyle({ width: 90 })}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const status = statuses[row.id] ?? "Not Started";
                    const ss = STATUS_STYLE[status];
                    return (
                      <tr key={row.id} style={{ background: status === "Done" ? "#F0FDF4" : "white" }}>
                        <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined })}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>{row.category}</span>
                        </td>
                        <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 600, color: "#0F3154" })}>{row.initiative}</td>
                        <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{row.action}</td>
                        <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{row.successMetric}</td>
                        <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#0F3154", whiteSpace: "nowrap" })}>{row.timing}</td>
                        <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined })}>
                          <button onClick={() => cycleStatus(row.id)} style={{
                            fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10,
                            border: "none", cursor: "pointer", background: ss.bg, color: ss.color, fontFamily: "inherit",
                          }}>{status}</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MilestoneTrackerView() {
  const [subsActual, setSubsActual] = usePersistedState<Record<number, string>>("mkt_tracker_subs", {});
  const [revActual,  setRevActual]  = usePersistedState<Record<number, string>>("mkt_tracker_rev", {});
  const saveSubs = (mo: number, v: string) => setSubsActual({ ...subsActual, [mo]: v });
  const saveRev  = (mo: number, v: string) => setRevActual({ ...revActual, [mo]: v });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)", marginBottom: 4 }}>Monthly Milestone Tracker</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Enter actuals as each month closes · Green = on target or ahead</div>
      <div style={tableWrap}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={thStyle({ width: 30 })}>Mo.</th>
                <th style={thStyle({ width: 80 })}>Month</th>
                <th style={thStyle({})}>Key Milestone</th>
                <th style={thStyle({ width: 90 })}>Subs Target</th>
                <th style={thStyle({ width: 100 })}>Subs Actual</th>
                <th style={thStyle({ width: 110 })}>Rev Target</th>
                <th style={thStyle({ width: 110 })}>Rev Actual</th>
              </tr>
            </thead>
            <tbody>
              {MILESTONE_TRACKER.map((row, i) => {
                const sa = subsActual[row.mo] ? parseInt(subsActual[row.mo]) : null;
                const ra = revActual[row.mo]  ? parseFloat(revActual[row.mo].replace(/[$,]/g, "")) : null;
                const subsOk = sa !== null && sa >= row.subsTarget;
                const revOk  = ra !== null && ra >= row.netRevTarget;
                const rowBg  = (subsOk && revOk) ? "#F0FDF4" : (sa !== null || ra !== null) ? "#FFFBEB" : "white";
                return (
                  <tr key={row.mo} style={{ background: rowBg }}>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 800, color: "#94a3b8" })}>{row.mo}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#0F3154", whiteSpace: "nowrap" })}>{row.month}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{row.keyMilestone}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#0F3154" })}>{row.subsTarget.toLocaleString()}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, padding: "6px 10px" })}>
                      <input type="text" value={subsActual[row.mo] ?? ""} onChange={e => saveSubs(row.mo, e.target.value)}
                        placeholder="—"
                        style={{ width: "100%", border: `1px solid ${subsOk ? "#86EFAC" : "#E1E8EF"}`, borderRadius: 6, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", color: "#0F3154", outline: "none", background: subsOk ? "#F0FDF4" : "#fff", boxSizing: "border-box", fontWeight: 600 }} />
                    </td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#0F3154" })}>${row.netRevTarget.toLocaleString()}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, padding: "6px 10px" })}>
                      <input type="text" value={revActual[row.mo] ?? ""} onChange={e => saveRev(row.mo, e.target.value)}
                        placeholder="—"
                        style={{ width: "100%", border: `1px solid ${revOk ? "#86EFAC" : "#E1E8EF"}`, borderRadius: 6, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", color: "#0F3154", outline: "none", background: revOk ? "#F0FDF4" : "#fff", boxSizing: "border-box", fontWeight: 600 }} />
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

function MonthlyPlanView() {
  const months = [...new Set(MONTHLY_PLAN.map(r => r.month))];
  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)", marginBottom: 4 }}>Monthly Campaign Plan</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>18-month campaign calendar · {MONTHLY_PLAN.length} channel rows</div>
      <div style={tableWrap}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={thStyle({ width: 80 })}>Month</th>
                <th style={thStyle({ width: 160 })}>Campaign</th>
                <th style={thStyle({ width: 120 })}>Channel</th>
                <th style={thStyle({})}>Key Actions</th>
                <th style={thStyle({ width: 160 })}>Content Output</th>
                <th style={thStyle({ width: 80 })}>Budget</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_PLAN.map((row, i) => {
                const cc = CHANNEL_COLOR[row.channel] ?? "#94a3b8";
                const prevMonth = i > 0 ? MONTHLY_PLAN[i - 1].month : null;
                const isNewMonth = prevMonth !== row.month;
                return (
                  <tr key={i} style={{ background: isNewMonth && i > 0 ? "#FAFBFC" : "white" }}>
                    <td style={{ ...tdStyle({ borderTop: i === 0 ? "none" : undefined }), fontWeight: isNewMonth ? 700 : 400, color: isNewMonth ? "#0F3154" : "#94a3b8", whiteSpace: "nowrap" }}>
                      {isNewMonth ? row.month : ""}
                    </td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 600, color: "#0F3154", fontSize: 11 })}>{row.campaign}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined })}>
                      {badge(cc + "18", cc, row.channel)}
                    </td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{row.keyActions}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b", fontSize: 11 })}>{row.contentOutput}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#0F3154", whiteSpace: "nowrap" })}>{row.budget}</td>
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

function AnnualCalendarView() {
  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)", marginBottom: 4 }}>Annual Calendar</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>High-level goals & budget · 18-month overview</div>
      <div style={tableWrap}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={thStyle({ width: 36 })}>Qtr</th>
                <th style={thStyle({ width: 80 })}>Month</th>
                <th style={thStyle({ width: 120 })}>Campaign</th>
                <th style={thStyle({ width: 160 })}>Social Goal</th>
                <th style={thStyle({ width: 160 })}>Email Goal</th>
                <th style={thStyle({ width: 160 })}>Ads Goal</th>
                <th style={thStyle({ width: 80 })}>Budget</th>
                <th style={thStyle({ width: 90 })}>Cumulative</th>
                <th style={thStyle({ width: 80 })}>Rev Target</th>
              </tr>
            </thead>
            <tbody>
              {ANNUAL_CALENDAR.map((row, i) => (
                <tr key={i}>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 800, color: "#0F3154", fontSize: 11 })}>{row.quarter}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 600, color: "#0F3154", whiteSpace: "nowrap" })}>{row.month}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 600, color: "#0F3154", fontSize: 11 })}>{row.campaign}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{row.socialGoal}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{row.emailGoal}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{row.adsGoal}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#0F3154", whiteSpace: "nowrap" })}>{row.budget}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b", whiteSpace: "nowrap" })}>{row.cumulative}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#16a34a", whiteSpace: "nowrap" })}>{row.revenueTarget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RoadmapView() {
  const [statuses, setStatuses] = usePersistedState<Record<number, ActionStatus>>("mkt_roadmap_status", {});
  const cycleStatus = (id: number) => {
    const cur = statuses[id] ?? "Not Started";
    const next = STATUS_OPTIONS[(STATUS_OPTIONS.indexOf(cur) + 1) % STATUS_OPTIONS.length];
    setStatuses({ ...statuses, [id]: next });
  };
  const TIER_COLOR: Record<string, string> = {
    "Tier 1: Quick Wins": "#0891b2", "Tier 2: Growth": "#7c3aed",
    "Tier 3: Long-Term": "#d97706", "Scaling": "#dc2626", "Milestone": "#16a34a",
  };
  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)", marginBottom: 4 }}>18-Month Roadmap to $1M+ ARR</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Click status badges to cycle · {ACTION_PLAN.filter((_, i) => (statuses[ACTION_PLAN[i].id] ?? "Not Started") === "Done").length} of {ACTION_PLAN.length} complete</div>
      <div style={tableWrap}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={thStyle({ width: 40 })}>Qtr</th>
                <th style={thStyle({ width: 80 })}>Month</th>
                <th style={thStyle({ width: 100 })}>Tier</th>
                <th style={thStyle({ width: 200 })}>Initiative</th>
                <th style={thStyle({})}>Key Actions</th>
                <th style={thStyle({ width: 160 })}>KPI</th>
                <th style={thStyle({ width: 120 })}>Rev Impact</th>
                <th style={thStyle({ width: 90 })}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ACTION_PLAN.map((row, i) => {
                const tc = TIER_COLOR[row.tier] ?? "#94a3b8";
                const status = statuses[row.id] ?? "Not Started";
                const ss = STATUS_STYLE[status];
                return (
                  <tr key={row.id} style={{ background: status === "Done" ? "#F0FDF4" : "white" }}>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 800, color: "#94a3b8", fontSize: 11 })}>{row.quarter}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 600, color: "#0F3154", whiteSpace: "nowrap" })}>{row.month}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined })}>
                      {badge(tc + "18", tc, row.tier.replace("Tier 1: ", "").replace("Tier 2: ", "").replace("Tier 3: ", ""))}
                    </td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 600, color: "#0F3154" })}>{row.initiative}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{row.keyActions}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{row.kpi}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#16a34a", whiteSpace: "nowrap" })}>{row.revenueImpact}</td>
                    <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined })}>
                      <button onClick={() => cycleStatus(row.id)} style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10,
                        border: "none", cursor: "pointer", background: ss.bg, color: ss.color, fontFamily: "inherit",
                      }}>{status}</button>
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

function MilestonesView() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)", marginBottom: 4 }}>Strategic Milestones</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Month-by-month milestones & revenue targets</div>
      <div style={tableWrap}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={thStyle({ width: 90 })}>Month</th>
                <th style={thStyle({ width: 120 })}>Theme</th>
                <th style={thStyle({})}>Key Milestones</th>
                <th style={thStyle({ width: 110 })}>MRR Target</th>
                <th style={thStyle({ width: 110 })}>Cumulative ARR</th>
              </tr>
            </thead>
            <tbody>
              {MILESTONES.map((row, i) => (
                <tr key={i} style={{ background: row.cumulativeArr.includes("✅") ? "#F0FDF4" : "white" }}>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#0F3154", whiteSpace: "nowrap" })}>{row.month}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 600, color: "#0F3154" })}>{row.theme}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined })}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {row.milestones.map((m, j) => (
                        <div key={j} style={{ fontSize: 12, color: "#64748b", display: "flex", gap: 6, alignItems: "flex-start" }}>
                          <span style={{ color: "#16a34a", fontWeight: 700, flexShrink: 0 }}>✓</span>
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#0F3154" })}>{row.revenueTarget}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: row.cumulativeArr.includes("✅") ? "#16a34a" : "#0F3154" })}>{row.cumulativeArr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function WeeklyTasksView() {
  const [done, setDone] = usePersistedState<Record<number, boolean>>("mkt_weekly_done", {});
  const toggleDone = (week: number) => setDone({ ...done, [week]: !done[week] });
  const doneCount = Object.values(done).filter(Boolean).length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)", marginBottom: 4 }}>Weekly Tasks — 52-Week Breakdown</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
        <span style={{ color: "#16a34a", fontWeight: 700 }}>{doneCount}</span> of 52 weeks complete
      </div>
      <div style={tableWrap}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              <th style={thStyle({ width: 36, textAlign: "center" })}>✓</th>
              <th style={thStyle({ width: 40 })}>Wk</th>
              <th style={thStyle({ width: 100 })}>Dates</th>
              <th style={thStyle({ width: 36 })}>Qtr</th>
              <th style={thStyle({ width: 160 })}>Focus Area</th>
              <th style={thStyle({})}>Tasks</th>
              <th style={thStyle({ width: 180 })}>Deliverable</th>
              <th style={thStyle({ width: 56 })}>Priority</th>
            </tr>
          </thead>
          <tbody>
            {WEEKLY_TASKS.map((row, i) => {
              const isDone = !!done[row.week];
              return (
                <tr key={row.week} style={{ background: isDone ? "#F0FDF4" : "white" }}>
                  <td style={{ ...tdStyle({ borderTop: i === 0 ? "none" : undefined }), textAlign: "center" }}>
                    <button onClick={() => toggleDone(row.week)} style={{
                      width: 20, height: 20, borderRadius: 5,
                      border: `2px solid ${isDone ? "#16a34a" : "#CBD5E1"}`,
                      background: isDone ? "#16a34a" : "white",
                      cursor: "pointer", display: "inline-flex", alignItems: "center",
                      justifyContent: "center", fontSize: 11, color: "white", padding: 0,
                    }}>{isDone ? "✓" : ""}</button>
                  </td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#94a3b8" })}>{row.week}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b", whiteSpace: "nowrap", fontSize: 11 })}>{row.dates}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 700, color: "#94a3b8", fontSize: 11 })}>{row.quarter}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, fontWeight: 600, color: "#0F3154" })}>{row.focusArea}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{row.tasks}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined, color: "#64748b" })}>{row.deliverables}</td>
                  <td style={tdStyle({ borderTop: i === 0 ? "none" : undefined })}>
                    {badge(row.priority === "High" ? "#FEE2E2" : "#FEF3C7", row.priority === "High" ? "#B91C1C" : "#92400E", row.priority)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RevenueModelView() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)", marginBottom: 4 }}>Revenue Model</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Projected annual revenue by stream · Year 1 target: $591,750</div>
      <div style={tableWrap}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={thStyle({})}>Revenue Stream</th>
                <th style={thStyle({ width: 80 })}>Launch</th>
                <th style={thStyle({ width: 80, textAlign: "right" })}>Q1</th>
                <th style={thStyle({ width: 80, textAlign: "right" })}>Q2</th>
                <th style={thStyle({ width: 90, textAlign: "right" })}>Q3</th>
                <th style={thStyle({ width: 90, textAlign: "right" })}>Q4</th>
                <th style={thStyle({ width: 100, textAlign: "right" })}>Year 1 Total</th>
                <th style={thStyle({ width: 200 })}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {REVENUE_MODEL.map((row, i) => (
                <tr key={i} style={{ background: row.isTotal ? "#0F3154" : "white" }}>
                  <td style={{ ...tdStyle({ borderTop: i === 0 ? "none" : undefined }), fontWeight: row.isTotal ? 800 : 600, color: row.isTotal ? "#fff" : "#0F3154" }}>{row.stream}</td>
                  <td style={{ ...tdStyle({ borderTop: i === 0 ? "none" : undefined }), color: row.isTotal ? "rgba(255,255,255,0.6)" : "#64748b", fontSize: 11 }}>{row.launchMonth}</td>
                  {[row.q1, row.q2, row.q3, row.q4, row.yearTotal].map((v, j) => (
                    <td key={j} style={{ ...tdStyle({ borderTop: i === 0 ? "none" : undefined, textAlign: "right" }), fontWeight: row.isTotal || j === 4 ? 800 : 500, color: row.isTotal ? (j === 4 ? "#4ade80" : "#fff") : (j === 4 ? "#16a34a" : "#334155") }}>{v}</td>
                  ))}
                  <td style={{ ...tdStyle({ borderTop: i === 0 ? "none" : undefined }), color: row.isTotal ? "rgba(255,255,255,0.7)" : "#64748b", fontSize: 11 }}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export function MarketingHub() {
  const [tab, setTabState] = useState<MTab>("blog");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("marketingSubTab") as MTab | null;
      if (saved && M_TABS.some(t => t.id === saved)) setTabState(saved);
    } catch {}
  }, []);

  const setTab = (t: MTab) => {
    setTabState(t);
    try { sessionStorage.setItem("marketingSubTab", t); } catch {}
  };

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ borderBottom: "1px solid #E1E8EF", background: "#FAFBFC" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", display: "flex", gap: 0, overflowX: "auto" }}>
          {M_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 18px", fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? "#0F3154" : "#94a3b8",
              background: "none", border: "none",
              borderBottom: tab === t.id ? "2px solid #0F3154" : "2px solid transparent",
              marginBottom: -1, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === "blog"    && <BlogCalendar />}
      {tab === "daily"   && <DailyPlaybook />}
      {tab === "plan12"  && <ActionPlan12 />}
      {tab === "tracker" && <MilestoneTrackerView />}
      {tab === "monthly" && <MonthlyPlanView />}
      {tab === "annual"  && <AnnualCalendarView />}
      {tab === "roadmap" && <RoadmapView />}
      {tab === "weekly"  && <WeeklyTasksView />}
      {tab === "revenue" && <RevenueModelView />}
    </div>
  );
}
