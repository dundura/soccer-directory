"use client";

import { useState, useEffect } from "react";

interface GuestLink { label: string; url: string; }

interface Booking {
  id: string;
  guestName: string;
  notes: string;
  links: GuestLink[];
  status: "upcoming" | "completed" | "cancelled";
}

const STORAGE_KEY = "snm_guest_bookings";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  upcoming:  { bg: "#eff6ff", color: "#1d4ed8" },
  completed: { bg: "#f0fdf4", color: "#16a34a" },
  cancelled: { bg: "#fef2f2", color: "#dc2626" },
};

const EMPTY_FORM = { guestName: "", notes: "", links: [{ label: "", url: "" }, { label: "", url: "" }] as GuestLink[], status: "upcoming" as Booking["status"] };

export function GuestsHub() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const [notesModal, setNotesModal] = useState<Booking | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBookings(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (updated: Booking[]) => {
    setBookings(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };

  const openEdit = (b: Booking) => {
    const links = [...(b.links || [])];
    while (links.length < 2) links.push({ label: "", url: "" });
    setForm({ guestName: b.guestName, notes: b.notes, links, status: b.status });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.guestName.trim()) return;
    const cleanLinks = form.links.filter(l => l.url.trim());
    if (editId) {
      save(bookings.map(b => b.id === editId ? { ...b, ...form, links: cleanLinks } : b));
    } else {
      save([{ id: Date.now().toString(), ...form, links: cleanLinks }, ...bookings]);
    }
    setShowForm(false);
  };

  const deleteBooking = (id: string) => save(bookings.filter(b => b.id !== id));

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const upcomingCount = bookings.filter(b => b.status === "upcoming").length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F3154", margin: 0 }}>Guest Bookings</h2>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>
            {upcomingCount} upcoming · {bookings.length} total
          </p>
        </div>
        <button onClick={openAdd}
          style={{ padding: "10px 20px", background: "#0F3154", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          + Add Guest
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {(["all", "upcoming", "completed", "cancelled"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid", borderColor: filter === f ? "#0F3154" : "#E1E8EF", background: filter === f ? "#0F3154" : "#fff", color: filter === f ? "#fff" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎙️</div>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>No guests yet</p>
          <p style={{ fontSize: 13, margin: "6px 0 0" }}>Add your upcoming podcast guests here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(b => {
            const sc = STATUS_COLORS[b.status];
            return (
              <div key={b.id} style={{ background: "#fff", border: "1px solid #E1E8EF", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0F3154" }}>{b.guestName}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: sc.bg, color: sc.color }}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {b.notes && (
                      <button onClick={() => setNotesModal(b)}
                        style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: "#1d4ed8", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontFamily: "inherit" }}>
                        📝 Notes
                      </button>
                    )}
                    {(b.links || []).filter(l => l.url).map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "#DC373E", fontWeight: 600, textDecoration: "none" }}>
                        {l.label || "Link"} ↗
                      </a>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => openEdit(b)}
                    style={{ padding: "5px 12px", border: "1px solid #E1E8EF", borderRadius: 6, background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#0F3154" }}>
                    Edit
                  </button>
                  <button onClick={() => deleteBooking(b.id)}
                    style={{ padding: "5px 10px", border: "none", borderRadius: 6, background: "#fef2f2", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#dc2626" }}>
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notes Modal */}
      {notesModal && (
        <div onClick={() => setNotesModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, padding: 28, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F3154", margin: 0 }}>{notesModal.guestName}</h3>
              <button onClick={() => setNotesModal(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ overflowY: "auto", fontSize: 14, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {notesModal.notes}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, padding: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F3154", margin: "0 0 20px" }}>
              {editId ? "Edit Guest" : "Add Guest"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Guest Name *</label>
                <input value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                  placeholder="e.g. Derek Messulam"
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E1E8EF", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Pitch, background, episode ideas..."
                  rows={4}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E1E8EF", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Links</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {form.links.map((link, i) => (
                    <div key={i} style={{ display: "flex", gap: 6 }}>
                      <input value={link.label} onChange={e => { const l = [...form.links]; l[i] = { ...l[i], label: e.target.value }; setForm(f => ({ ...f, links: l })); }}
                        placeholder="Label"
                        style={{ width: "30%", padding: "8px 10px", border: "1.5px solid #E1E8EF", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                      <input value={link.url} onChange={e => { const l = [...form.links]; l[i] = { ...l[i], url: e.target.value }; setForm(f => ({ ...f, links: l })); }}
                        placeholder="https://..."
                        style={{ flex: 1, padding: "8px 10px", border: "1.5px solid #E1E8EF", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  {form.links.length < 5 && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, links: [...f.links, { label: "", url: "" }] }))}
                      style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: "#1d4ed8", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                      + Add another link
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Booking["status"] }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E1E8EF", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: 11, border: "1.5px solid #E1E8EF", borderRadius: 8, background: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#64748b" }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={!form.guestName.trim()}
                style={{ flex: 2, padding: 11, border: "none", borderRadius: 8, background: !form.guestName.trim() ? "#cbd5e1" : "#0F3154", color: "#fff", fontSize: 14, fontWeight: 700, cursor: !form.guestName.trim() ? "not-allowed" : "pointer" }}>
                {editId ? "Save Changes" : "Add Guest"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
