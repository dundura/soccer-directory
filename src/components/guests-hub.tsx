"use client";

import { useState, useEffect } from "react";

interface GuestLink { label: string; url: string; }

interface Booking {
  id: string;
  guestName: string;
  email?: string;
  phone?: string;
  notes: string;
  links: GuestLink[];
  status: "upcoming" | "completed" | "cancelled";
  update: string;
}

const STORAGE_KEY = "snm_guest_bookings";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  upcoming:  { bg: "#eff6ff", color: "#1d4ed8" },
  completed: { bg: "#f0fdf4", color: "#16a34a" },
  cancelled: { bg: "#fef2f2", color: "#dc2626" },
};

const EMPTY_FORM = { guestName: "", email: "", phone: "", notes: "", links: [{ label: "", url: "" }, { label: "", url: "" }] as GuestLink[], status: "upcoming" as Booking["status"], update: "" };

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
    setForm({ guestName: b.guestName, email: b.email || "", phone: b.phone || "", notes: b.notes, links, status: b.status, update: b.update || "" });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.guestName.trim()) return;
    const cleanLinks = form.links.filter(l => l.url.trim());
    if (editId) {
      save(bookings.map(b => b.id === editId ? { ...b, ...form, links: cleanLinks, update: form.update } : b));
    } else {
      save([{ id: Date.now().toString(), ...form, links: cleanLinks, update: form.update }, ...bookings]);
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

      {/* Bookings table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎙️</div>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>No guests yet</p>
          <p style={{ fontSize: 13, margin: "6px 0 0" }}>Add your upcoming podcast guests here.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E1E8EF", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={th()}>Guest</th>
                <th style={th()}>Email</th>
                <th style={th()}>Phone</th>
                <th style={th()}>Status</th>
                <th style={th()}>Notes</th>
                <th style={th()}>Links</th>
                <th style={th()}>Update</th>
                <th style={th()}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                  <td style={{ ...td(), fontWeight: 700, color: "#0F3154", fontSize: 14 }}>{b.guestName}</td>
                  <td style={td()}>
                    {b.email && (
                      <a href={`mailto:${b.email}`} style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 600, textDecoration: "none" }}>
                        {b.email}
                      </a>
                    )}
                  </td>
                  <td style={{ ...td(), whiteSpace: "nowrap" }}>
                    {b.phone && (
                      <a href={`tel:${b.phone}`} style={{ fontSize: 12, color: "#334155", fontWeight: 600, textDecoration: "none" }}>
                        {b.phone}
                      </a>
                    )}
                  </td>
                  <td style={td()}>
                    <select
                      value={b.status}
                      onChange={e => save(bookings.map(x => x.id === b.id ? { ...x, status: e.target.value as Booking["status"] } : x))}
                      style={{ border: "1px solid #E1E8EF", borderRadius: 7, padding: "4px 8px", fontSize: 12, fontWeight: 700, cursor: "pointer", background: STATUS_COLORS[b.status]?.bg || "#F1F5F9", color: STATUS_COLORS[b.status]?.color || "#64748b", outline: "none" }}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={td()}>
                    {b.notes && (
                      <button onClick={() => setNotesModal(b)}
                        style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: "#1d4ed8", cursor: "pointer", fontWeight: 600, textDecoration: "underline", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                        📝 Notes
                      </button>
                    )}
                  </td>
                  <td style={{ ...td(), maxWidth: 220 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {(b.links || []).filter(l => l.url).map((l, i) => (
                        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, color: "#DC373E", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                          {l.label || "Link"} ↗
                        </a>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...td(), maxWidth: 200 }}>
                    <input
                      value={b.update || ""}
                      onChange={e => save(bookings.map(x => x.id === b.id ? { ...x, update: e.target.value } : x))}
                      placeholder="Notes on progress…"
                      style={{ border: "1px solid #E1E8EF", borderRadius: 7, padding: "4px 8px", fontSize: 12, color: "#334155", outline: "none", width: "100%", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </td>
                  <td style={td()}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(b)}
                        style={{ padding: "4px 10px", border: "1px solid #E1E8EF", borderRadius: 6, background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#0F3154" }}>
                        Edit
                      </button>
                      <button onClick={() => deleteBooking(b.id)}
                        style={{ padding: "4px 8px", border: "none", borderRadius: 6, background: "#fef2f2", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#dc2626" }}>
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="guest@email.com"
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E1E8EF", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E1E8EF", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
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

function th(): React.CSSProperties {
  return { padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", whiteSpace: "nowrap" };
}
function td(): React.CSSProperties {
  return { padding: "11px 14px", verticalAlign: "middle", fontSize: 13, color: "#334155" };
}
