"use client";

import { useState, useEffect, useCallback } from "react";

type Contact = {
  id: number; first_name: string; last_name: string; email: string;
  phone: string; team: string; onboarding_date: string; group_name: string;
  notes: string; created_at: string;
};
type Group = { id: number; name: string; sort_order: number };

const EMPTY_FORM = { firstName: "", lastName: "", email: "", phone: "", team: "", onboardingDate: "", groupName: "", notes: "" };

export function AdminCRM() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showGroupManager, setShowGroupManager] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/crm");
    if (res.ok) {
      const data = await res.json();
      setContacts(data.contacts);
      setGroups(data.groups);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function setField(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      await fetch("/api/admin/crm", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, ...form }) });
      setEditingId(null);
    } else {
      await fetch("/api/admin/crm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setForm(EMPTY_FORM);
    await fetchData();
    setSaving(false);
  }

  function startEdit(c: Contact) {
    setEditingId(c.id);
    setForm({ firstName: c.first_name, lastName: c.last_name, email: c.email, phone: c.phone, team: c.team, onboardingDate: c.onboarding_date, groupName: c.group_name, notes: c.notes });
    setTimeout(() => document.getElementById("crm-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this contact?")) return;
    await fetch("/api/admin/crm", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await fetchData();
  }

  async function handleAddGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroup.trim()) return;
    await fetch("/api/admin/crm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "addGroup", name: newGroup.trim() }) });
    setNewGroup("");
    await fetchData();
  }

  async function handleDeleteGroup(id: number) {
    if (!confirm("Delete this group? Contacts in it will become ungrouped.")) return;
    await fetch("/api/admin/crm", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "deleteGroup" }) });
    await fetchData();
  }

  async function moveGroup(idx: number, dir: -1 | 1) {
    const reordered = [...groups];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= reordered.length) return;
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    const updated = reordered.map((g, i) => ({ id: g.id, sort_order: i }));
    setGroups(reordered.map((g, i) => ({ ...g, sort_order: i })));
    await fetch("/api/admin/crm", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reorderGroups", groups: updated }) });
  }

  function toggleCollapse(name: string) {
    setCollapsed((s) => { const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n; });
  }

  const groupNames = groups.map((g) => g.name);
  const ungrouped = contacts.filter((c) => !c.group_name || !groupNames.includes(c.group_name));

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";

  if (loading) return <div className="text-center py-12 text-muted">Loading CRM...</div>;

  return (
    <div className="space-y-6">
      {/* Add / Edit Form */}
      <div id="crm-form" className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mb-4">
          {editingId ? "Edit Contact" : "Add Contact"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="First Name" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className={inputClass} />
            <input type="text" placeholder="Last Name" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputClass} />
            <input type="text" placeholder="Phone Number" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Team" value={form.team} onChange={(e) => setField("team", e.target.value)} className={inputClass} />
            <input type="text" placeholder="Onboarding Date (mm/dd/yyyy)" value={form.onboardingDate} onChange={(e) => setField("onboardingDate", e.target.value)} className={inputClass} />
          </div>
          <select value={form.groupName} onChange={(e) => setField("groupName", e.target.value)} className={inputClass}>
            <option value="">— No Group —</option>
            {groups.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
          </select>
          <textarea placeholder="Notes..." value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={2} className={inputClass} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }} className="px-5 py-2 rounded-lg border border-border text-sm hover:bg-surface transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Group Manager Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Pipeline ({contacts.length} contacts)
        </h3>
        <button onClick={() => setShowGroupManager(!showGroupManager)} className="text-sm text-accent font-semibold hover:text-accent-hover transition-colors">
          {showGroupManager ? "Hide" : "Manage"} Groups
        </button>
      </div>

      {/* Group Manager */}
      {showGroupManager && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="space-y-2 mb-4">
            {groups.map((g, i) => (
              <div key={g.id} className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2">
                <span className="flex-1 text-sm font-medium">{g.name}</span>
                <button onClick={() => moveGroup(i, -1)} disabled={i === 0} className="text-xs text-muted hover:text-primary disabled:opacity-30">&uarr;</button>
                <button onClick={() => moveGroup(i, 1)} disabled={i === groups.length - 1} className="text-xs text-muted hover:text-primary disabled:opacity-30">&darr;</button>
                <button onClick={() => handleDeleteGroup(g.id)} className="text-red-400 hover:text-red-600 text-xs">&times;</button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddGroup} className="flex gap-2">
            <input type="text" placeholder="New group name..." value={newGroup} onChange={(e) => setNewGroup(e.target.value)} className={`flex-1 ${inputClass}`} />
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">Add</button>
          </form>
        </div>
      )}

      {/* Contacts by Group */}
      {groups.map((group) => {
        const gc = contacts.filter((c) => c.group_name === group.name);
        const isCollapsed = collapsed.has(group.name);
        return (
          <div key={group.id} className="bg-white rounded-2xl border border-border overflow-hidden">
            <button onClick={() => toggleCollapse(group.name)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface/50 transition-colors">
              <span className="font-bold text-sm text-primary">{group.name}</span>
              <span className="text-xs text-muted">{gc.length} contact{gc.length !== 1 ? "s" : ""} {isCollapsed ? "+" : "−"}</span>
            </button>
            {!isCollapsed && gc.length > 0 && (
              <div className="border-t border-border">
                <table className="w-full text-sm">
                  <thead><tr className="bg-surface/50 text-left">
                    <th className="px-4 py-2 font-semibold text-primary">Name</th>
                    <th className="px-4 py-2 font-semibold text-primary">Email</th>
                    <th className="px-4 py-2 font-semibold text-primary">Phone</th>
                    <th className="px-4 py-2 font-semibold text-primary">Team</th>
                    <th className="px-4 py-2 font-semibold text-primary">Notes</th>
                    <th className="px-4 py-2"></th>
                  </tr></thead>
                  <tbody>
                    {gc.map((c) => (
                      <tr key={c.id} className="border-t border-border hover:bg-surface/30">
                        <td className="px-4 py-2.5">{c.first_name} {c.last_name}</td>
                        <td className="px-4 py-2.5 text-muted">{c.email}</td>
                        <td className="px-4 py-2.5 text-muted">{c.phone}</td>
                        <td className="px-4 py-2.5 text-muted">{c.team}</td>
                        <td className="px-4 py-2.5 text-muted max-w-[200px] truncate">{c.notes}</td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <button onClick={() => startEdit(c)} className="text-accent hover:text-accent-hover text-xs font-semibold mr-3">Edit</button>
                          <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!isCollapsed && gc.length === 0 && (
              <div className="border-t border-border px-5 py-3 text-sm text-muted">No contacts in this group.</div>
            )}
          </div>
        );
      })}

      {/* Ungrouped */}
      {ungrouped.length > 0 && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <button onClick={() => toggleCollapse("__ungrouped")} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface/50 transition-colors">
            <span className="font-bold text-sm text-muted">No Group</span>
            <span className="text-xs text-muted">{ungrouped.length} contact{ungrouped.length !== 1 ? "s" : ""} {collapsed.has("__ungrouped") ? "+" : "−"}</span>
          </button>
          {!collapsed.has("__ungrouped") && (
            <div className="border-t border-border">
              <table className="w-full text-sm">
                <thead><tr className="bg-surface/50 text-left">
                  <th className="px-4 py-2 font-semibold text-primary">Name</th>
                  <th className="px-4 py-2 font-semibold text-primary">Email</th>
                  <th className="px-4 py-2 font-semibold text-primary">Phone</th>
                  <th className="px-4 py-2 font-semibold text-primary">Team</th>
                  <th className="px-4 py-2 font-semibold text-primary">Notes</th>
                  <th className="px-4 py-2"></th>
                </tr></thead>
                <tbody>
                  {ungrouped.map((c) => (
                    <tr key={c.id} className="border-t border-border hover:bg-surface/30">
                      <td className="px-4 py-2.5">{c.first_name} {c.last_name}</td>
                      <td className="px-4 py-2.5 text-muted">{c.email}</td>
                      <td className="px-4 py-2.5 text-muted">{c.phone}</td>
                      <td className="px-4 py-2.5 text-muted">{c.team}</td>
                      <td className="px-4 py-2.5 text-muted max-w-[200px] truncate">{c.notes}</td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <button onClick={() => startEdit(c)} className="text-accent hover:text-accent-hover text-xs font-semibold mr-3">Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
