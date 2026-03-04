"use client";

import { useState, useEffect, useCallback } from "react";

type Resource = { id: number; item: string; description: string; created_at: string };

export function AdminResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [item, setItem] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const fetchResources = useCallback(async () => {
    const res = await fetch("/api/admin/resources");
    if (res.ok) setResources(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!item.trim()) return;
    setSaving(true);
    await fetch("/api/admin/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item: item.trim(), description: description.trim() }) });
    setItem(""); setDescription("");
    await fetchResources();
    setSaving(false);
  }

  async function handleDelete(id: number) {
    await fetch("/api/admin/resources", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await fetchResources();
  }

  function startEdit(r: Resource) {
    setEditingId(r.id);
    setEditItem(r.item);
    setEditDesc(r.description || "");
  }

  async function saveEdit() {
    if (!editItem.trim()) return;
    await fetch("/api/admin/resources", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, item: editItem, description: editDesc }) });
    setEditingId(null);
    await fetchResources();
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";

  if (loading) return <div className="text-center py-12 text-muted">Loading resources...</div>;

  return (
    <div className="space-y-6">
      {/* Add Form */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mb-4">Add Resource</h3>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3">
          <input type="text" placeholder="Item *" value={item} onChange={(e) => setItem(e.target.value)} className={`flex-1 min-w-[200px] ${inputClass}`} />
          <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className={`flex-1 min-w-[200px] ${inputClass}`} />
          <button type="submit" disabled={saving || !item.trim()} className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
            Add
          </button>
        </form>
      </div>

      {/* Resources Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3.5">
          <h3 className="font-bold text-sm text-primary">Resources ({resources.length})</h3>
        </div>
        {resources.length === 0 ? (
          <div className="px-5 pb-5 text-sm text-muted">No resources yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-surface/50 text-left border-t border-border">
              <th className="px-4 py-2 font-semibold text-primary">Item</th>
              <th className="px-4 py-2 font-semibold text-primary">Description</th>
              <th className="px-4 py-2"></th>
            </tr></thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-surface/30">
                  <td className="px-4 py-2.5">
                    {editingId === r.id ? (
                      <input type="text" value={editItem} onChange={(e) => setEditItem(e.target.value)} className={inputClass} />
                    ) : (
                      r.item
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted">
                    {editingId === r.id ? (
                      <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className={inputClass} />
                    ) : (
                      r.description
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {editingId === r.id ? (
                      <>
                        <button onClick={saveEdit} className="text-accent hover:text-accent-hover text-xs font-semibold mr-3">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-muted hover:text-primary text-xs font-semibold">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(r)} className="text-accent hover:text-accent-hover text-xs font-semibold mr-3">Edit</button>
                        <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
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
