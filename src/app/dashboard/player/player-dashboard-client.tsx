"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type Tab = "calendar" | "goals" | "training" | "stats" | "notes";

const TABS: { key: Tab; label: string }[] = [
  { key: "calendar", label: "Calendar" },
  { key: "goals", label: "Goals" },
  { key: "training", label: "Training Log" },
  { key: "stats", label: "Game Stats" },
  { key: "notes", label: "Notes" },
];

const TABLE_MAP: Record<Tab, string> = {
  calendar: "player_calendar_events",
  goals: "player_goals",
  training: "player_training_logs",
  stats: "player_game_stats",
  notes: "player_notes",
};

const EVENT_TYPES = ["Practice", "Game", "Tournament", "Tryout", "Training", "Camp", "Other"];
const GOAL_CATEGORIES = ["Technical", "Physical", "Tactical", "Mental", "Academic", "General"];
const SESSION_TYPES = ["Individual", "Team Practice", "Private Training", "Futsal", "Pickup", "Gym", "Other"];
const INTENSITIES = ["Low", "Medium", "High"];
const RESULTS = ["Win", "Loss", "Draw"];
const NOTE_CATEGORIES = ["General", "Coach Feedback", "Self-Assessment", "Game Review", "Scouting", "Other"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ── Shared form input components ──
function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <input {...props} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
    </div>
  );
}

function Select({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <select {...props} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white">
        {options.map((o) => <option key={o} value={o.toLowerCase()}>{o}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <textarea {...props} rows={3} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none" />
    </div>
  );
}

// ── Calendar Tab ──
function CalendarTab({ playerId, data, reload }: { playerId: string; data: Row[]; reload: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", eventType: "practice", eventDate: todayStr(), startTime: "", endTime: "", location: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function resetForm() {
    setForm({ title: "", eventType: "practice", eventDate: todayStr(), startTime: "", endTime: "", location: "", notes: "" });
    setEditId(null);
    setShowForm(false);
  }

  function startEdit(row: Row) {
    setForm({
      title: row.title,
      eventType: row.event_type,
      eventDate: row.event_date?.split("T")[0] || "",
      startTime: row.start_time || "",
      endTime: row.end_time || "",
      location: row.location || "",
      notes: row.notes || "",
    });
    setEditId(row.id);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, table: TABLE_MAP.calendar, ...form } : { playerId, table: TABLE_MAP.calendar, ...form };
    await fetch("/api/player-dashboard", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    resetForm();
    reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch("/api/player-dashboard", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, table: TABLE_MAP.calendar }) });
    reload();
  }

  // Group events by upcoming vs past
  const today = todayStr();
  const upcoming = data.filter((r) => (r.event_date?.split("T")[0] || "") >= today);
  const past = data.filter((r) => (r.event_date?.split("T")[0] || "") < today);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Calendar</h3>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors">+ Add Event</button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-surface rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Select label="Type" options={EVENT_TYPES} value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Date" type="date" required value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input label="End Time" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : editId ? "Update" : "Add Event"}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}

      {data.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted">
          <p className="text-4xl mb-3">&#128197;</p>
          <p className="font-medium">No events yet</p>
          <p className="text-sm mt-1">Add your practices, games, and tournaments to stay organized.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Upcoming</h4>
          <div className="space-y-2 mb-6">
            {upcoming.reverse().map((row) => (
              <div key={row.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{row.event_type}</span>
                    <span className="text-xs text-muted">{formatDate(row.event_date?.split("T")[0])}</span>
                    {row.start_time && <span className="text-xs text-muted">{row.start_time}{row.end_time ? ` - ${row.end_time}` : ""}</span>}
                  </div>
                  <p className="font-semibold text-sm">{row.title}</p>
                  {row.location && <p className="text-xs text-muted mt-0.5">{row.location}</p>}
                </div>
                <div className="flex gap-1.5 shrink-0 ml-4">
                  <button onClick={() => startEdit(row)} className="text-xs px-3 py-1.5 rounded-lg bg-surface hover:bg-border transition-colors">Edit</button>
                  <button onClick={() => handleDelete(row.id)} className="text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Past Events</h4>
          <div className="space-y-2">
            {past.map((row) => (
              <div key={row.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between opacity-60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{row.event_type}</span>
                    <span className="text-xs text-muted">{formatDate(row.event_date?.split("T")[0])}</span>
                  </div>
                  <p className="font-semibold text-sm">{row.title}</p>
                </div>
                <div className="flex gap-1.5 shrink-0 ml-4">
                  <button onClick={() => handleDelete(row.id)} className="text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Goals Tab ──
function GoalsTab({ playerId, data, reload }: { playerId: string; data: Row[]; reload: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "general", targetDate: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function resetForm() { setForm({ title: "", category: "general", targetDate: "", notes: "" }); setEditId(null); setShowForm(false); }

  function startEdit(row: Row) {
    setForm({ title: row.title, category: row.category, targetDate: row.target_date?.split("T")[0] || "", notes: row.notes || "" });
    setEditId(row.id);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, table: TABLE_MAP.goals, ...form } : { playerId, table: TABLE_MAP.goals, ...form };
    await fetch("/api/player-dashboard", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    resetForm();
    reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this goal?")) return;
    await fetch("/api/player-dashboard", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, table: TABLE_MAP.goals }) });
    reload();
  }

  async function updateProgress(row: Row, progress: number) {
    const status = progress >= 100 ? "completed" : "active";
    await fetch("/api/player-dashboard", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, table: TABLE_MAP.goals, title: row.title, category: row.category, targetDate: row.target_date?.split("T")[0] || null, status, progress, notes: row.notes }),
    });
    reload();
  }

  const active = data.filter((r) => r.status === "active");
  const completed = data.filter((r) => r.status === "completed");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Goals</h3>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors">+ New Goal</button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-surface rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Goal" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Select label="Category" options={GOAL_CATEGORIES} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Target Date" type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            <div />
          </div>
          <Textarea label="Details" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : editId ? "Update" : "Add Goal"}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}

      {data.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted">
          <p className="text-4xl mb-3">&#127919;</p>
          <p className="font-medium">No goals yet</p>
          <p className="text-sm mt-1">Set goals to track your development and stay motivated.</p>
        </div>
      )}

      {active.length > 0 && (
        <>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Active Goals</h4>
          <div className="space-y-3 mb-6">
            {active.map((row) => (
              <div key={row.id} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-accent/10 text-accent-hover px-2 py-0.5 rounded-full">{row.category}</span>
                      {row.target_date && <span className="text-xs text-muted">Target: {formatDate(row.target_date.split("T")[0])}</span>}
                    </div>
                    <p className="font-semibold text-sm">{row.title}</p>
                    {row.notes && <p className="text-xs text-muted mt-1">{row.notes}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0 ml-4">
                    <button onClick={() => startEdit(row)} className="text-xs px-3 py-1.5 rounded-lg bg-surface hover:bg-border transition-colors">Edit</button>
                    <button onClick={() => handleDelete(row.id)} className="text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors">Delete</button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 bg-surface rounded-full h-2.5">
                    <div className="bg-accent h-2.5 rounded-full transition-all" style={{ width: `${row.progress || 0}%` }} />
                  </div>
                  <span className="text-xs font-bold text-muted w-10 text-right">{row.progress || 0}%</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[0, 25, 50, 75, 100].map((p) => (
                    <button key={p} onClick={() => updateProgress(row, p)} className={`text-xs px-2 py-1 rounded-md transition-colors ${(row.progress || 0) >= p ? "bg-accent/20 text-accent-hover font-bold" : "bg-surface text-muted hover:bg-border"}`}>{p}%</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {completed.length > 0 && (
        <>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Completed</h4>
          <div className="space-y-2">
            {completed.map((row) => (
              <div key={row.id} className="bg-white rounded-xl border border-green-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-lg">&#10003;</span>
                  <div>
                    <p className="font-semibold text-sm">{row.title}</p>
                    <span className="text-xs text-muted">{row.category}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(row.id)} className="text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors">Delete</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Training Log Tab ──
function TrainingTab({ playerId, data, reload }: { playerId: string; data: Row[]; reload: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sessionDate: todayStr(), durationMinutes: "60", sessionType: "individual", focusArea: "", intensity: "medium", notes: "" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function resetForm() { setForm({ sessionDate: todayStr(), durationMinutes: "60", sessionType: "individual", focusArea: "", intensity: "medium", notes: "" }); setEditId(null); setShowForm(false); }

  function startEdit(row: Row) {
    setForm({
      sessionDate: row.session_date?.split("T")[0] || "",
      durationMinutes: String(row.duration_minutes || 0),
      sessionType: row.session_type || "individual",
      focusArea: row.focus_area || "",
      intensity: row.intensity || "medium",
      notes: row.notes || "",
    });
    setEditId(row.id);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const payload = { ...form, durationMinutes: parseInt(form.durationMinutes) || 0 };
    const body = editId ? { id: editId, table: TABLE_MAP.training, ...payload } : { playerId, table: TABLE_MAP.training, ...payload };
    await fetch("/api/player-dashboard", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    resetForm();
    reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch("/api/player-dashboard", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, table: TABLE_MAP.training }) });
    reload();
  }

  // Stats summary
  const totalMinutes = data.reduce((s, r) => s + (r.duration_minutes || 0), 0);
  const totalSessions = data.length;
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekStr = thisWeekStart.toISOString().split("T")[0];
  const weekSessions = data.filter((r) => (r.session_date?.split("T")[0] || "") >= thisWeekStr).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Training Log</h3>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors">+ Log Session</button>
      </div>

      {/* Quick stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{totalSessions}</p>
            <p className="text-xs text-muted">Total Sessions</p>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{Math.round(totalMinutes / 60)}h</p>
            <p className="text-xs text-muted">Total Hours</p>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{weekSessions}</p>
            <p className="text-xs text-muted">This Week</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="bg-surface rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input label="Date" type="date" required value={form.sessionDate} onChange={(e) => setForm({ ...form, sessionDate: e.target.value })} />
            <Input label="Duration (min)" type="number" required min={1} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
            <Select label="Type" options={SESSION_TYPES} value={form.sessionType} onChange={(e) => setForm({ ...form, sessionType: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Focus Area" placeholder="e.g. Passing, Shooting" value={form.focusArea} onChange={(e) => setForm({ ...form, focusArea: e.target.value })} />
            <Select label="Intensity" options={INTENSITIES} value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : editId ? "Update" : "Log Session"}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}

      {data.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted">
          <p className="text-4xl mb-3">&#9889;</p>
          <p className="font-medium">No training sessions logged</p>
          <p className="text-sm mt-1">Track your training to see your progress over time.</p>
        </div>
      )}

      {data.length > 0 && (
        <div className="space-y-2">
          {data.map((row) => (
            <div key={row.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold bg-accent/10 text-accent-hover px-2 py-0.5 rounded-full">{row.session_type}</span>
                  <span className="text-xs text-muted">{formatDate(row.session_date?.split("T")[0])}</span>
                  <span className="text-xs font-semibold">{row.duration_minutes} min</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${row.intensity === "high" ? "bg-red-50 text-red-600" : row.intensity === "medium" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-600"}`}>{row.intensity}</span>
                </div>
                {row.focus_area && <p className="text-sm font-medium">{row.focus_area}</p>}
                {row.notes && <p className="text-xs text-muted mt-0.5">{row.notes}</p>}
              </div>
              <div className="flex gap-1.5 shrink-0 ml-4">
                <button onClick={() => startEdit(row)} className="text-xs px-3 py-1.5 rounded-lg bg-surface hover:bg-border transition-colors">Edit</button>
                <button onClick={() => handleDelete(row.id)} className="text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Game Stats Tab ──
function StatsTab({ playerId, data, reload }: { playerId: string; data: Row[]; reload: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ gameDate: todayStr(), opponent: "", result: "win", minutesPlayed: "0", goals: "0", assists: "0", shots: "0", passes: "0", tackles: "0", saves: "0", notes: "" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function resetForm() { setForm({ gameDate: todayStr(), opponent: "", result: "win", minutesPlayed: "0", goals: "0", assists: "0", shots: "0", passes: "0", tackles: "0", saves: "0", notes: "" }); setEditId(null); setShowForm(false); }

  function startEdit(row: Row) {
    setForm({
      gameDate: row.game_date?.split("T")[0] || "",
      opponent: row.opponent || "",
      result: row.result || "win",
      minutesPlayed: String(row.minutes_played || 0),
      goals: String(row.goals || 0),
      assists: String(row.assists || 0),
      shots: String(row.shots || 0),
      passes: String(row.passes || 0),
      tackles: String(row.tackles || 0),
      saves: String(row.saves || 0),
      notes: row.notes || "",
    });
    setEditId(row.id);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const payload = {
      ...form,
      minutesPlayed: parseInt(form.minutesPlayed) || 0,
      goals: parseInt(form.goals) || 0,
      assists: parseInt(form.assists) || 0,
      shots: parseInt(form.shots) || 0,
      passes: parseInt(form.passes) || 0,
      tackles: parseInt(form.tackles) || 0,
      saves: parseInt(form.saves) || 0,
    };
    const body = editId ? { id: editId, table: TABLE_MAP.stats, ...payload } : { playerId, table: TABLE_MAP.stats, ...payload };
    await fetch("/api/player-dashboard", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    resetForm();
    reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this game?")) return;
    await fetch("/api/player-dashboard", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, table: TABLE_MAP.stats }) });
    reload();
  }

  // Totals
  const totalGames = data.length;
  const totalGoals = data.reduce((s, r) => s + (r.goals || 0), 0);
  const totalAssists = data.reduce((s, r) => s + (r.assists || 0), 0);
  const wins = data.filter((r) => r.result === "win").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Game Stats</h3>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors">+ Add Game</button>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{totalGames}</p>
            <p className="text-xs text-muted">Games</p>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{totalGoals}</p>
            <p className="text-xs text-muted">Goals</p>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{totalAssists}</p>
            <p className="text-xs text-muted">Assists</p>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0}%</p>
            <p className="text-xs text-muted">Win Rate</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="bg-surface rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input label="Date" type="date" required value={form.gameDate} onChange={(e) => setForm({ ...form, gameDate: e.target.value })} />
            <Input label="Opponent" value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} />
            <Select label="Result" options={RESULTS} value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <Input label="Minutes" type="number" min={0} value={form.minutesPlayed} onChange={(e) => setForm({ ...form, minutesPlayed: e.target.value })} />
            <Input label="Goals" type="number" min={0} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
            <Input label="Assists" type="number" min={0} value={form.assists} onChange={(e) => setForm({ ...form, assists: e.target.value })} />
            <Input label="Shots" type="number" min={0} value={form.shots} onChange={(e) => setForm({ ...form, shots: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Passes" type="number" min={0} value={form.passes} onChange={(e) => setForm({ ...form, passes: e.target.value })} />
            <Input label="Tackles" type="number" min={0} value={form.tackles} onChange={(e) => setForm({ ...form, tackles: e.target.value })} />
            <Input label="Saves" type="number" min={0} value={form.saves} onChange={(e) => setForm({ ...form, saves: e.target.value })} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : editId ? "Update" : "Add Game"}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}

      {data.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted">
          <p className="text-4xl mb-3">&#9917;</p>
          <p className="font-medium">No game stats yet</p>
          <p className="text-sm mt-1">Log your games to track goals, assists, and performance over time.</p>
        </div>
      )}

      {data.length > 0 && (
        <div className="space-y-2">
          {data.map((row) => (
            <div key={row.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.result === "win" ? "bg-green-50 text-green-700" : row.result === "loss" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-700"}`}>{row.result?.toUpperCase()}</span>
                  <span className="text-xs text-muted">{formatDate(row.game_date?.split("T")[0])}</span>
                  {row.opponent && <span className="text-xs text-muted">vs {row.opponent}</span>}
                </div>
                <div className="flex gap-4 text-sm">
                  {(row.goals > 0 || row.assists > 0) && (
                    <span className="font-bold">{row.goals}G {row.assists}A</span>
                  )}
                  {row.minutes_played > 0 && <span className="text-muted">{row.minutes_played}&apos;</span>}
                  {row.shots > 0 && <span className="text-muted">{row.shots} shots</span>}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0 ml-4">
                <button onClick={() => startEdit(row)} className="text-xs px-3 py-1.5 rounded-lg bg-surface hover:bg-border transition-colors">Edit</button>
                <button onClick={() => handleDelete(row.id)} className="text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Notes Tab ──
function NotesTab({ playerId, data, reload }: { playerId: string; data: Row[]; reload: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "general" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  function resetForm() { setForm({ title: "", body: "", category: "general" }); setEditId(null); setShowForm(false); }

  function startEdit(row: Row) {
    setForm({ title: row.title, body: row.body || "", category: row.category || "general" });
    setEditId(row.id);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, table: TABLE_MAP.notes, ...form } : { playerId, table: TABLE_MAP.notes, ...form };
    await fetch("/api/player-dashboard", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    resetForm();
    reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) return;
    await fetch("/api/player-dashboard", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, table: TABLE_MAP.notes }) });
    reload();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Notes</h3>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors">+ New Note</button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-surface rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Select label="Category" options={NOTE_CATEGORIES} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <Textarea label="Content" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : editId ? "Update" : "Save Note"}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}

      {data.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted">
          <p className="text-4xl mb-3">&#128221;</p>
          <p className="font-medium">No notes yet</p>
          <p className="text-sm mt-1">Keep track of coach feedback, self-assessments, and game reviews.</p>
        </div>
      )}

      {data.length > 0 && (
        <div className="space-y-2">
          {data.map((row) => (
            <div key={row.id} className="bg-white rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-surface/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold bg-surface text-primary px-2 py-0.5 rounded-full">{row.category}</span>
                    <span className="text-xs text-muted">{formatDate(row.created_at?.split("T")[0])}</span>
                  </div>
                  <p className="font-semibold text-sm">{row.title}</p>
                </div>
                <span className="text-muted text-xs">{expanded === row.id ? "▲" : "▼"}</span>
              </button>
              {expanded === row.id && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  {row.body && <p className="text-sm text-muted whitespace-pre-line mb-3">{row.body}</p>}
                  <div className="flex gap-1.5">
                    <button onClick={() => startEdit(row)} className="text-xs px-3 py-1.5 rounded-lg bg-surface hover:bg-border transition-colors">Edit</button>
                    <button onClick={() => handleDelete(row.id)} className="text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ──
export default function PlayerDashboardClient() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const playerIdParam = searchParams.get("id");

  const [players, setPlayers] = useState<Row[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(playerIdParam);
  const [tab, setTab] = useState<Tab>("calendar");
  const [tabData, setTabData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Fetch user's player profiles
  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const res = await fetch("/api/listings");
        if (res.ok) {
          const all = await res.json();
          const playerListings = all.filter((l: Row) => l.type === "player");
          setPlayers(playerListings);
          if (playerListings.length === 1 && !selectedPlayer) {
            setSelectedPlayer(playerListings[0].id);
          }
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [status]);

  const fetchTabData = useCallback(async () => {
    if (!selectedPlayer) return;
    setTabLoading(true);
    try {
      const res = await fetch(`/api/player-dashboard?playerId=${selectedPlayer}&table=${TABLE_MAP[tab]}`);
      if (res.ok) {
        setTabData(await res.json());
      }
    } catch { /* ignore */ }
    setTabLoading(false);
  }, [selectedPlayer, tab]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-muted">
        <p>Loading...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <p className="text-muted mb-4">Please sign in to access your player dashboard.</p>
        <a href="/dashboard" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors">Sign In</a>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <p className="text-4xl mb-4">&#9917;</p>
        <h2 className="font-bold text-xl mb-2">No Player Profile Found</h2>
        <p className="text-muted mb-6">Create a player profile first to access your dashboard.</p>
        <a href="/dashboard?type=player" className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors">Create Player Profile</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <a href="/dashboard" className="text-sm text-accent-hover hover:underline mb-1 inline-block">&larr; Back to Dashboard</a>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">Player Dashboard</h2>
        </div>
        {players.length > 1 && (
          <select
            value={selectedPlayer || ""}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border text-sm"
          >
            <option value="">Select player...</option>
            {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              tab === t.key ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {tabLoading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : !selectedPlayer ? (
          <div className="text-center py-12 text-muted">Select a player profile to get started.</div>
        ) : (
          <>
            {tab === "calendar" && <CalendarTab playerId={selectedPlayer} data={tabData} reload={fetchTabData} />}
            {tab === "goals" && <GoalsTab playerId={selectedPlayer} data={tabData} reload={fetchTabData} />}
            {tab === "training" && <TrainingTab playerId={selectedPlayer} data={tabData} reload={fetchTabData} />}
            {tab === "stats" && <StatsTab playerId={selectedPlayer} data={tabData} reload={fetchTabData} />}
            {tab === "notes" && <NotesTab playerId={selectedPlayer} data={tabData} reload={fetchTabData} />}
          </>
        )}
      </div>
    </div>
  );
}
