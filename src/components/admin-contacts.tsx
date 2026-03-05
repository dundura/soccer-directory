"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

type Contact = {
  id: number; name: string; email: string; social: string; phone: string;
  notes: string; action_item: string; group_name: string; created_at: string;
};

export function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState({ name: "", email: "", social: "", phone: "", notes: "", actionItem: "", groupName: "" });
  const [newGroup, setNewGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const fetchContacts = useCallback(async () => {
    const res = await fetch("/api/admin/contacts");
    if (res.ok) setContacts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  // All unique group names
  const allGroups = useMemo(() => {
    const set = new Set(contacts.map((c) => c.group_name || ""));
    return Array.from(set).filter(Boolean).sort();
  }, [contacts]);

  const effectiveGroup = newGroup.trim() || form.groupName;

  function setField(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { ...form, groupName: effectiveGroup };
    if (editingId) {
      await fetch("/api/admin/contacts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, ...payload }) });
      setEditingId(null);
    } else {
      await fetch("/api/admin/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setForm({ name: "", email: "", social: "", phone: "", notes: "", actionItem: "", groupName: "" });
    setNewGroup("");
    await fetchContacts();
    setSaving(false);
  }

  function startEdit(c: Contact) {
    setEditingId(c.id);
    setForm({ name: c.name, email: c.email || "", social: c.social || "", phone: c.phone || "", notes: c.notes || "", actionItem: c.action_item || "", groupName: c.group_name || "" });
    setNewGroup("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this contact?")) return;
    await fetch("/api/admin/contacts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await fetchContacts();
  }

  function toggleCollapse(groupName: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  }

  // Filter by search and group
  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (filterGroup !== "all" && (c.group_name || "") !== filterGroup) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !(c.email || "").toLowerCase().includes(q) && !(c.action_item || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [contacts, search, filterGroup]);

  // Group contacts
  const grouped = useMemo(() => {
    const map = new Map<string, Contact[]>();
    for (const c of filtered) {
      const key = c.group_name || "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });
  }, [filtered]);

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";
  const selectClass = "px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30";

  if (loading) return <div className="text-center py-12 text-muted">Loading contacts...</div>;

  function renderContactTable(groupContacts: Contact[]) {
    return (
      <table className="w-full text-sm">
        <thead><tr className="bg-surface/50 text-left border-t border-border">
          <th className="px-4 py-2 font-semibold text-primary">Name</th>
          <th className="px-4 py-2 font-semibold text-primary">Email</th>
          <th className="px-4 py-2 font-semibold text-primary">Social</th>
          <th className="px-4 py-2 font-semibold text-primary">Phone</th>
          <th className="px-4 py-2 font-semibold text-primary">Action Item</th>
          <th className="px-4 py-2 font-semibold text-primary">Notes</th>
          <th className="px-4 py-2"></th>
        </tr></thead>
        <tbody>
          {groupContacts.map((c) => (
            <tr key={c.id} className="border-t border-border hover:bg-surface/30">
              <td className="px-4 py-2.5 font-medium">{c.name}</td>
              <td className="px-4 py-2.5 text-muted">{c.email}</td>
              <td className="px-4 py-2.5 text-muted">{c.social}</td>
              <td className="px-4 py-2.5 text-muted">{c.phone}</td>
              <td className="px-4 py-2.5">
                {c.action_item ? (
                  <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">{c.action_item}</span>
                ) : (
                  <span className="text-muted">&mdash;</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-muted max-w-[200px] truncate">{c.notes}</td>
              <td className="px-4 py-2.5 text-right whitespace-nowrap">
                <button onClick={() => startEdit(c)} className="text-accent hover:text-accent-hover text-xs font-semibold mr-3">Edit</button>
                <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add / Edit Form */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mb-4">
          {editingId ? "Edit Contact" : "Add Contact"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Name *" value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Social (Instagram, Twitter, etc.)" value={form.social} onChange={(e) => setField("social", e.target.value)} className={inputClass} />
            <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={inputClass} />
          </div>
          <input type="text" placeholder="Action Item (e.g. Follow up, Send proposal, Schedule call...)" value={form.actionItem} onChange={(e) => setField("actionItem", e.target.value)} className={inputClass} />
          <div className="flex gap-2">
            <select value={form.groupName} onChange={(e) => { setField("groupName", e.target.value); if (e.target.value) setNewGroup(""); }} className={selectClass + " flex-1"}>
              <option value="">No Group</option>
              {allGroups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <input type="text" placeholder="Or new group name..." value={newGroup} onChange={(e) => { setNewGroup(e.target.value); if (e.target.value) setField("groupName", ""); }} className={inputClass + " flex-1"} />
          </div>
          <textarea placeholder="Notes..." value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={2} className={inputClass} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving || !form.name.trim()} className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", email: "", social: "", phone: "", notes: "", actionItem: "", groupName: "" }); setNewGroup(""); }} className="px-5 py-2 rounded-lg border border-border text-sm hover:bg-surface transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search + Group Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 rounded-lg border border-border text-sm w-56 focus:outline-none focus:ring-2 focus:ring-accent/30" />
        {allGroups.length > 0 && (
          <>
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">Group:</span>
            <button onClick={() => setFilterGroup("all")} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterGroup === "all" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}>
              All ({contacts.length})
            </button>
            {allGroups.map((g) => {
              const count = contacts.filter((c) => (c.group_name || "") === g).length;
              return (
                <button key={g} onClick={() => setFilterGroup(g)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterGroup === g ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}>
                  {g} ({count})
                </button>
              );
            })}
            {contacts.some((c) => !c.group_name) && (
              <button onClick={() => setFilterGroup("")} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterGroup === "" ? "bg-primary text-white" : "bg-surface text-muted hover:bg-gray-200"}`}>
                Ungrouped ({contacts.filter((c) => !c.group_name).length})
              </button>
            )}
          </>
        )}
      </div>

      {/* Grouped Contact List */}
      {grouped.map(([groupName, groupContacts]) => {
        const isCollapsed = collapsedGroups.has(groupName);
        return (
          <div key={groupName} className="bg-white rounded-2xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCollapse(groupName)}
              className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-surface/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                <h3 className="font-bold text-sm text-primary">{groupName || "Ungrouped"}</h3>
                <span className="text-xs text-muted">({groupContacts.length})</span>
              </div>
            </button>
            {!isCollapsed && renderContactTable(groupContacts)}
          </div>
        );
      })}

      {grouped.length === 0 && (
        <div className="bg-white rounded-2xl border border-border p-6 text-sm text-muted">
          {search ? "No matches." : "No contacts yet."}
        </div>
      )}
    </div>
  );
}
