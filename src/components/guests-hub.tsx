"use client";

import { useState, useEffect } from "react";

interface Booking {
  id: string;
  guestName: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  status: "upcoming" | "completed" | "cancelled";
}

const STORAGE_KEY = "snm_guest_bookings";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  upcoming:  { bg: "#eff6ff", color: "#1d4ed8" },
  completed: { bg: "#f0fdf4", color: "#16a34a" },
  cancelled: { bg: "#fef2f2", color: "#dc2626" },
};

export function GuestsHub() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [form, setForm] = useState({ guestName: "", date: "", time: "", location: "", notes: "", status: "upcoming" as Booking["status"] });

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

  const openAdd = () => {
    setForm({ guestName: "", date: "", time: "", location: "", notes: "", status: "upcoming" });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (b: Booking) => {
    setForm({ guestName: b.guestName, date: b.date, time: b.time, location: b.location, notes: b.notes, status: b.status });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.guestName.trim() || !form.date) return;
    if (editId) {
      save(bookings.map(b => b.id === editId ? { ...b, ...form } : b));
    } else {
      save([{ id: Date.now().toString(), ...form }, ...bookings]);
    }
    setShowForm(false);
  };

  const deleteBooking = (id: string) => save(bookings.filter(b => b.id !== id));

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const sorted = [...filtered].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

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
          + Add Booking
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
      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>No bookings yet</p>
          <p style={{ fontSize: 13, margin: "6px 0 0" }}>Add your upcoming guest sessions here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map(b => {
            const sc = STATUS_COLORS[b.status];
            return (
              <div key={b.id} style={{ background: "#fff", border: "1px solid #E1E8EF", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 16 }}>
                {/* Date block */}
                <div style={{ textAlign: "center", minWidth: 48, background: "#f8fafc", borderRadius: 8, padding: "8px 6px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                    {b.date ? new Date(b.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" }) : "—"}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#0F3154", lineHeight: 1 }}>
                    {b.date ? new Date(b.date + "T12:00:00").getDate() : "—"}
                  </div>
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0F3154" }}>{b.guestName}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: sc.bg, color: sc.color }}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {b.time && <span>🕐 {b.time}</span>}
                    {b.location && <span>📍 {b.location}</span>}
                  </div>
                  {b.notes && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{b.notes}</div>}
                </div>
                {/* Actions */}
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

      {/* Add/Edit Modal */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, padding: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F3154", margin: "0 0 20px" }}>
              {editId ? "Edit Booking" : "Add Booking"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Guest Name *", key: "guestName", placeholder: "e.g. Smith Family" },
                { label: "Location", key: "location", placeholder: "e.g. Main Street Field" },
                { label: "Notes", key: "notes", placeholder: "Any details..." },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E1E8EF", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E1E8EF", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Time</label>
                  <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E1E8EF", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
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
              <button onClick={handleSubmit} disabled={!form.guestName.trim() || !form.date}
                style={{ flex: 2, padding: 11, border: "none", borderRadius: 8, background: !form.guestName.trim() || !form.date ? "#cbd5e1" : "#0F3154", color: "#fff", fontSize: 14, fontWeight: 700, cursor: !form.guestName.trim() || !form.date ? "not-allowed" : "pointer" }}>
                {editId ? "Save Changes" : "Add Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
