"use client";

import { useState, useEffect, useCallback } from "react";

type Contact = { id: number; name: string; email: string; social: string; phone: string; notes: string; created_at: string };

export function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState({ name: "", email: "", social: "", phone: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchContacts = useCallback(async () => {
    const res = await fetch("/api/admin/contacts");
    if (res.ok) setContacts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  function setField(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    if (editingId) {
      await fetch("/api/admin/contacts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, ...form }) });
      setEditingId(null);
    } else {
      await fetch("/api/admin/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setForm({ name: "", email: "", social: "", phone: "", notes: "" });
    await fetchContacts();
    setSaving(false);
  }

  function startEdit(c: Contact) {
    setEditingId(c.id);
    setForm({ name: c.name, email: c.email || "", social: c.social || "", phone: c.phone || "", notes: c.notes || "" });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this contact?")) return;
    await fetch("/api/admin/contacts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await fetchContacts();
  }

  const filtered = search
    ? contacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.email && c.email.toLowerCase().includes(search.toLowerCase())))
    : contacts;

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";

  if (loading) return <div className="text-center py-12 text-muted">Loading contacts...</div>;

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
          <textarea placeholder="Notes..." value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={2} className={inputClass} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving || !form.name.trim()} className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", email: "", social: "", phone: "", notes: "" }); }} className="px-5 py-2 rounded-lg border border-border text-sm hover:bg-surface transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search + Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between gap-4">
          <h3 className="font-bold text-sm text-primary">Contacts ({contacts.length})</h3>
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border text-sm w-48 focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 pb-5 text-sm text-muted">{search ? "No matches." : "No contacts yet."}</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-surface/50 text-left border-t border-border">
              <th className="px-4 py-2 font-semibold text-primary">Name</th>
              <th className="px-4 py-2 font-semibold text-primary">Email</th>
              <th className="px-4 py-2 font-semibold text-primary">Social</th>
              <th className="px-4 py-2 font-semibold text-primary">Phone</th>
              <th className="px-4 py-2 font-semibold text-primary">Notes</th>
              <th className="px-4 py-2"></th>
            </tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-surface/30">
                  <td className="px-4 py-2.5 font-medium">{c.name}</td>
                  <td className="px-4 py-2.5 text-muted">{c.email}</td>
                  <td className="px-4 py-2.5 text-muted">{c.social}</td>
                  <td className="px-4 py-2.5 text-muted">{c.phone}</td>
                  <td className="px-4 py-2.5 text-muted max-w-[200px] truncate">{c.notes}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(c)} className="text-accent hover:text-accent-hover text-xs font-semibold mr-3">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
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
