"use client";

import { useState, useEffect, useCallback } from "react";

type Todo = { id: number; item: string; notes: string; status: string; created_at: string };

const STATUS_LABELS: Record<string, string> = { pending: "Pending", in_progress: "In Progress", completed: "Completed" };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};
const NEXT_STATUS: Record<string, string> = { pending: "in_progress", in_progress: "completed", completed: "pending" };

export function AdminTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [item, setItem] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/admin/todos");
    if (res.ok) setTodos(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!item.trim()) return;
    setSaving(true);
    await fetch("/api/admin/todos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item: item.trim(), notes: notes.trim() }) });
    setItem(""); setNotes("");
    await fetchTodos();
    setSaving(false);
  }

  async function toggleStatus(todo: Todo) {
    await fetch("/api/admin/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: todo.id, item: todo.item, notes: todo.notes, status: NEXT_STATUS[todo.status] || "pending" }) });
    await fetchTodos();
  }

  async function handleDelete(id: number) {
    await fetch("/api/admin/todos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await fetchTodos();
  }

  function startEdit(t: Todo) {
    setEditingId(t.id);
    setEditItem(t.item);
    setEditNotes(t.notes || "");
  }

  async function saveEdit(t: Todo) {
    await fetch("/api/admin/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: t.id, item: editItem, notes: editNotes, status: t.status }) });
    setEditingId(null);
    await fetchTodos();
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";

  if (loading) return <div className="text-center py-12 text-muted">Loading todos...</div>;

  return (
    <div className="space-y-6">
      {/* Add Form */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mb-4">Add Todo</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <input type="text" placeholder="Item *" value={item} onChange={(e) => setItem(e.target.value)} className={inputClass} />
          <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
          <button type="submit" disabled={saving || !item.trim()} className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
            Add
          </button>
        </form>
      </div>

      {/* Todo List */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3.5">
          <h3 className="font-bold text-sm text-primary">Todo List ({todos.length})</h3>
        </div>
        {todos.length === 0 ? (
          <div className="px-5 pb-5 text-sm text-muted">No todos yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-surface/50 text-left border-t border-border">
              <th className="px-4 py-2 font-semibold text-primary w-8"></th>
              <th className="px-4 py-2 font-semibold text-primary">Item</th>
              <th className="px-4 py-2 font-semibold text-primary">Notes</th>
              <th className="px-4 py-2 font-semibold text-primary">Status</th>
              <th className="px-4 py-2"></th>
            </tr></thead>
            <tbody>
              {todos.map((t) => (
                <tr key={t.id} className={`border-t border-border hover:bg-surface/30 ${t.status === "completed" ? "opacity-60" : ""}`}>
                  <td className="px-4 py-2.5">
                    <input type="checkbox" checked={t.status === "completed"} onChange={() => toggleStatus(t)} className="rounded" />
                  </td>
                  <td className="px-4 py-2.5">
                    {editingId === t.id ? (
                      <input type="text" value={editItem} onChange={(e) => setEditItem(e.target.value)} className={inputClass} />
                    ) : (
                      <span className={t.status === "completed" ? "line-through text-muted" : ""}>{t.item}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted">
                    {editingId === t.id ? (
                      <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className={inputClass} />
                    ) : (
                      <span className="max-w-[300px] truncate block">{t.notes}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => toggleStatus(t)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[t.status] || STATUS_COLORS.pending}`}>
                      {STATUS_LABELS[t.status] || t.status}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {editingId === t.id ? (
                      <>
                        <button onClick={() => saveEdit(t)} className="text-accent hover:text-accent-hover text-xs font-semibold mr-3">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-muted hover:text-primary text-xs font-semibold">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(t)} className="text-accent hover:text-accent-hover text-xs font-semibold mr-3">Edit</button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
