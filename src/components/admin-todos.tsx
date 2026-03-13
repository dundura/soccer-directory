"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

type Todo = { id: number; item: string; notes: string; status: string; project: string; hidden: boolean; created_at: string };

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
  const [project, setProject] = useState("");
  const [newProject, setNewProject] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editProject, setEditProject] = useState("");
  const [editNewProject, setEditNewProject] = useState("");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/admin/todos");
    if (res.ok) setTodos(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const visibleTodos = useMemo(() => todos.filter((t) => !t.hidden), [todos]);
  const hiddenTodos = useMemo(() => todos.filter((t) => t.hidden), [todos]);
  const activeTodos = showHidden ? hiddenTodos : visibleTodos;

  // Get unique project names from active set
  const projects = useMemo(() => {
    const set = new Set(activeTodos.map((t) => t.project || ""));
    return Array.from(set).sort((a, b) => {
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });
  }, [activeTodos]);

  // All project names (for dropdowns)
  const allProjects = useMemo(() => {
    const set = new Set(todos.map((t) => t.project || ""));
    return Array.from(set).filter(Boolean).sort();
  }, [todos]);

  // Group todos by project
  const grouped = useMemo(() => {
    const filtered = filterProject === "all" ? activeTodos : activeTodos.filter((t) => (t.project || "") === filterProject);
    const map = new Map<string, Todo[]>();
    for (const t of filtered) {
      const key = t.project || "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });
  }, [activeTodos, filterProject]);

  const effectiveProject = newProject.trim() || project;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!item.trim()) return;
    setSaving(true);
    await fetch("/api/admin/todos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item: item.trim(), notes: notes.trim(), project: effectiveProject }) });
    setItem(""); setNotes(""); setNewProject("");
    await fetchTodos();
    setSaving(false);
  }

  async function toggleStatus(todo: Todo) {
    await fetch("/api/admin/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: todo.id, item: todo.item, notes: todo.notes, status: NEXT_STATUS[todo.status] || "pending", project: todo.project || "", hidden: todo.hidden }) });
    await fetchTodos();
  }

  async function toggleHidden(todo: Todo) {
    await fetch("/api/admin/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: todo.id, item: todo.item, notes: todo.notes, status: todo.status, project: todo.project || "", hidden: !todo.hidden }) });
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
    setEditProject(t.project || "");
    setEditNewProject("");
  }

  async function saveEdit(t: Todo) {
    const finalProject = editNewProject.trim() || editProject;
    await fetch("/api/admin/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: t.id, item: editItem, notes: editNotes, status: t.status, project: finalProject, hidden: t.hidden }) });
    setEditingId(null);
    await fetchTodos();
  }

  function toggleCollapse(projectName: string) {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectName)) next.delete(projectName);
      else next.add(projectName);
      return next;
    });
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";
  const selectClass = "px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30";

  if (loading) return <div className="text-center py-12 text-muted">Loading todos...</div>;

  function renderTodoTable(projectTodos: Todo[]) {
    return (
      <table className="w-full text-sm">
        <thead><tr className="bg-surface/50 text-left border-t border-border">
          <th className="px-4 py-2 font-semibold text-primary w-8"></th>
          <th className="px-4 py-2 font-semibold text-primary">Item</th>
          <th className="px-4 py-2 font-semibold text-primary">Notes</th>
          <th className="px-4 py-2 font-semibold text-primary">Status</th>
          <th className="px-4 py-2"></th>
        </tr></thead>
        <tbody>
          {projectTodos.map((t) => (
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
                  <div className="space-y-1">
                    <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notes" className={inputClass} />
                    <div className="flex gap-2">
                      <select value={editProject} onChange={(e) => { setEditProject(e.target.value); if (e.target.value) setEditNewProject(""); }} className={selectClass + " flex-1"}>
                        <option value="">No Project</option>
                        {allProjects.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input type="text" placeholder="Or new project..." value={editNewProject} onChange={(e) => { setEditNewProject(e.target.value); if (e.target.value) setEditProject(""); }} className={inputClass + " flex-1"} />
                    </div>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap break-words">{t.notes}</span>
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
                    <button onClick={() => toggleHidden(t)} className="text-gray-400 hover:text-gray-600 text-xs font-semibold mr-3" title={t.hidden ? "Unhide" : "Hide"}>
                      {t.hidden ? "Unhide" : "Hide"}
                    </button>
                    <button onClick={() => startEdit(t)} className="text-accent hover:text-accent-hover text-xs font-semibold mr-3">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Form */}
      {!showHidden && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mb-4">Add Todo</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <input type="text" placeholder="Item *" value={item} onChange={(e) => setItem(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
            <div className="flex gap-2">
              <select value={project} onChange={(e) => { setProject(e.target.value); if (e.target.value) setNewProject(""); }} className={selectClass + " flex-1"}>
                <option value="">No Project</option>
                {allProjects.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <input type="text" placeholder="Or new project name..." value={newProject} onChange={(e) => { setNewProject(e.target.value); if (e.target.value) setProject(""); }} className={inputClass + " flex-1"} />
            </div>
            <button type="submit" disabled={saving || !item.trim()} className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
              Add
            </button>
          </form>
        </div>
      )}

      {/* Active / Hidden toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => { setShowHidden(false); setFilterProject("all"); }} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${!showHidden ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}>
          Active ({visibleTodos.length})
        </button>
        <button onClick={() => { setShowHidden(true); setFilterProject("all"); }} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${showHidden ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}>
          Hidden ({hiddenTodos.length})
        </button>
      </div>

      {/* Filter by project */}
      {projects.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted uppercase tracking-wide">Filter:</span>
          <button onClick={() => setFilterProject("all")} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterProject === "all" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}>
            All ({activeTodos.length})
          </button>
          {projects.map((p) => {
            const count = activeTodos.filter((t) => (t.project || "") === p).length;
            return (
              <button key={p} onClick={() => setFilterProject(p)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterProject === p ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}>
                {p || "Ungrouped"} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Grouped Todo List */}
      {grouped.map(([projectName, projectTodos]) => {
        const isCollapsed = collapsedProjects.has(projectName);
        const completedCount = projectTodos.filter((t) => t.status === "completed").length;
        return (
          <div key={projectName} className="bg-white rounded-2xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCollapse(projectName)}
              className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-surface/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                <h3 className="font-bold text-sm text-primary">{projectName || "Ungrouped"}</h3>
                <span className="text-xs text-muted">({completedCount}/{projectTodos.length} done)</span>
              </div>
              <div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${projectTodos.length > 0 ? (completedCount / projectTodos.length) * 100 : 0}%` }} />
              </div>
            </button>
            {!isCollapsed && renderTodoTable(projectTodos)}
          </div>
        );
      })}

      {grouped.length === 0 && (
        <div className="bg-white rounded-2xl border border-border p-6 text-sm text-muted">
          {showHidden ? "No hidden todos." : "No todos yet."}
        </div>
      )}
    </div>
  );
}
