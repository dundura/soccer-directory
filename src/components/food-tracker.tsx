"use client";

import { useState, useEffect, useCallback } from "react";

type FoodEntry = { id: number; meal_type: string; kind: string; description: string; created_at: string };

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack", "activity"];

export function FoodTracker() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [kind, setKind] = useState<"planned" | "actual">("planned");
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/admin/food?date=${date}`);
    if (res.ok) setEntries(await res.json());
  }, [date]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    await fetch("/api/admin/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, mealType, kind, description: description.trim() }),
    });
    setDescription("");
    await fetchEntries();
    setLoading(false);
  }

  async function handleDelete(id: number) {
    await fetch("/api/admin/food", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchEntries();
  }

  const planned = entries.filter((e) => e.kind === "planned");
  const actual = entries.filter((e) => e.kind === "actual");

  function changeDate(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6 mt-8">
      <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mb-4">Food Tracker</h3>

      {/* Date Navigation */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => changeDate(-1)} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface transition-colors">&larr;</button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button onClick={() => changeDate(1)} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface transition-colors">&rarr;</button>
        <button onClick={() => setDate(new Date().toISOString().slice(0, 10))} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-accent hover:text-accent-hover transition-colors">Today</button>
      </div>

      {/* Add Entry Form */}
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-6">
        <select value={kind} onChange={(e) => setKind(e.target.value as "planned" | "actual")} className="px-3 py-2 rounded-lg border border-border text-sm bg-white">
          <option value="planned">Planned</option>
          <option value="actual">Ate</option>
        </select>
        <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="px-3 py-2 rounded-lg border border-border text-sm bg-white">
          {MEAL_TYPES.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
        </select>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you eat / plan to eat?"
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="submit"
          disabled={loading || !description.trim()}
          className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Planned */}
        <div>
          <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">Planned</h4>
          {planned.length === 0 ? (
            <p className="text-sm text-muted">No planned meals for this day.</p>
          ) : (
            <div className="space-y-2">
              {planned.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2 bg-blue-50 rounded-lg px-3 py-2">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                    {entry.meal_type}
                  </span>
                  <span className="text-sm flex-1">{entry.description}</span>
                  <button onClick={() => handleDelete(entry.id)} className="text-red-400 hover:text-red-600 text-xs shrink-0">x</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actual */}
        <div>
          <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wide">Actually Ate</h4>
          {actual.length === 0 ? (
            <p className="text-sm text-muted">No entries yet for this day.</p>
          ) : (
            <div className="space-y-2">
              {actual.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2 bg-green-50 rounded-lg px-3 py-2">
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                    {entry.meal_type}
                  </span>
                  <span className="text-sm flex-1">{entry.description}</span>
                  <button onClick={() => handleDelete(entry.id)} className="text-red-400 hover:text-red-600 text-xs shrink-0">x</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
