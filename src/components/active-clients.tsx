"use client";

import React, { useState, useEffect, useRef } from "react";

interface Activity { id: number; client_id: number; text: string; notes: string; due_date: string; completed: boolean; completed_at: string | null; created_at: string; }
interface Client {
  id: number; name: string; email: string; phone: string;
  status: string; team: string; notes: string; contact_date: string; activities: Activity[];
}

const STATUS_COLORS: Record<string, string> = {
  Lead: "#0891b2", Proposal: "#d97706", "Trying to Book Demo": "#c026d3",
  "Demo Booked": "#0d9488", "Demo Conducted": "#ea580c",
  "Demo Completed": "#f59e0b", "Waiting on Roster": "#8b5cf6",
  "Invoice Sent": "#2563eb",
  Won: "#16a34a", Paused: "#7c3aed", Churned: "#94a3b8",
};
const STATUSES = ["Lead", "Proposal", "Trying to Book Demo", "Demo Booked", "Demo Conducted", "Demo Completed", "Waiting on Roster", "Invoice Sent", "Won", "Paused", "Churned"];

const card: React.CSSProperties = {
  background: "#fff", borderRadius: 14, border: "1px solid #E1E8EF",
  boxShadow: "0 2px 8px rgba(15,49,84,0.05)",
};

const th: React.CSSProperties = {
  padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700,
  color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em",
  borderBottom: "1px solid #E1E8EF", whiteSpace: "nowrap",
};

function EditableCell({ value, onSave, placeholder, type = "text" }: {
  value: string; onSave: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  useEffect(() => { setVal(value); }, [value]);
  const commit = () => { setEditing(false); if (val !== value) onSave(val); };
  return editing ? (
    <input ref={ref} value={val} type={type}
      onChange={e => setVal(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(value); setEditing(false); } }}
      style={{ width: "100%", border: "1px solid #0891b2", borderRadius: 6, padding: "4px 8px", fontSize: 13, fontFamily: "inherit", color: "#0F3154", outline: "none", boxSizing: "border-box" }} />
  ) : (
    <div onClick={() => setEditing(true)}
      style={{ fontSize: 13, color: value ? "#0F3154" : "#CBD5E1", cursor: "text", padding: "4px 0", minHeight: 24 }}>
      {value || placeholder || "—"}
    </div>
  );
}

// localStorage helpers for client order
function loadOrderedClients(data: Client[]): Client[] {
  try {
    const saved = localStorage.getItem("focus_client_order");
    if (!saved) return data;
    const order: number[] = JSON.parse(saved);
    return [...data].sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  } catch { return data; }
}
function saveClientOrder(ordered: Client[]) {
  try { localStorage.setItem("focus_client_order", JSON.stringify(ordered.map(c => c.id))); } catch {}
}

export function ActiveClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "pipeline">("list");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [actFilter, setActFilter] = useState<Record<number, "open" | "completed">>({});
  const [search, setSearch] = useState("");

  // Pipeline drag state
  const [pipelineDragOver, setPipelineDragOver] = useState<string | null>(null);

  // List row drag state
  const [listDragSrc, setListDragSrc] = useState<number | null>(null);
  const [listDragOver, setListDragOver] = useState<number | null>(null);

  const [newActivity, setNewActivity] = useState<Record<number, { text: string; notes: string; due_date: string }>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newStatus, setNewStatus] = useState("Lead");
  const [newTeam, setNewTeam] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/focus/clients").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setClients(loadOrderedClients(data));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleExpand = (id: number) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const getFilter = (id: number): "open" | "completed" => actFilter[id] ?? "open";
  const setFilter = (id: number, f: "open" | "completed") =>
    setActFilter(p => ({ ...p, [id]: f }));

  const addClient = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/focus/clients", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), email: newEmail, phone: newPhone, status: newStatus, team: newTeam }),
    }).then(r => r.json());
    if (res.id) {
      setClients(p => [res, ...p]);
      setNewName(""); setNewEmail(""); setNewPhone(""); setNewStatus("Lead"); setNewTeam(""); setShowAdd(false);
    }
  };

  const updateClient = async (id: number, field: string, value: string) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    const updated = { ...client, [field]: value };
    setClients(p => p.map(c => c.id === id ? { ...c, [field]: value } : c));
    await fetch("/api/focus/clients", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: updated.name, email: updated.email, phone: updated.phone, status: updated.status, team: updated.team, notes: updated.notes, contact_date: updated.contact_date || null }),
    });
  };

  const deleteClient = async (id: number) => {
    if (!confirm("Delete this client?")) return;
    setClients(p => p.filter(c => c.id !== id));
    await fetch("/api/focus/clients", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };

  // Reorder clients in list view
  const moveClient = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const next = [...clients];
    const [removed] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, removed);
    setClients(next);
    saveClientOrder(next);
  };

  const getNewAct = (clientId: number) => newActivity[clientId] || { text: "", notes: "", due_date: "" };

  const addActivity = async (clientId: number) => {
    const act = getNewAct(clientId);
    if (!act.text.trim()) return;
    const res = await fetch("/api/focus/clients/activities", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, text: act.text.trim(), notes: act.notes, due_date: act.due_date }),
    }).then(r => r.json());
    if (res.id) {
      setClients(p => p.map(c => c.id === clientId ? { ...c, activities: [...c.activities, res] } : c));
      setNewActivity(p => ({ ...p, [clientId]: { text: "", notes: "", due_date: "" } }));
    }
  };

  const updateActivity = async (clientId: number, actId: number, field: string, value: string) => {
    setClients(p => p.map(c => c.id === clientId
      ? { ...c, activities: c.activities.map(a => a.id === actId ? { ...a, [field]: value } : a) }
      : c));
    const act = clients.find(c => c.id === clientId)?.activities.find(a => a.id === actId);
    if (!act) return;
    const updated = { ...act, [field]: value };
    await fetch("/api/focus/clients/activities", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: actId, text: updated.text, notes: updated.notes, due_date: updated.due_date }),
    });
  };

  const toggleComplete = async (clientId: number, actId: number, current: boolean) => {
    const nowIso = new Date().toISOString();
    setClients(p => p.map(c => c.id === clientId
      ? { ...c, activities: c.activities.map(a => a.id === actId
          ? { ...a, completed: !current, completed_at: !current ? nowIso : null }
          : a) }
      : c));
    await fetch("/api/focus/clients/activities", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: actId, completed: !current }),
    });
  };

  const deleteActivity = async (clientId: number, actId: number) => {
    setClients(p => p.map(c => c.id === clientId ? { ...c, activities: c.activities.filter(a => a.id !== actId) } : c));
    await fetch("/api/focus/clients/activities", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: actId }) });
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Loading...</div>;

  const q = search.trim().toLowerCase();
  const visibleClients = q
    ? clients.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.team?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q)
      )
    : clients;

  const canDrag = !q; // disable drag when searching

  return (
    <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)" }}>Active Clients</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{visibleClients.length} client{visibleClients.length !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..."
            style={{ border: "1px solid #E1E8EF", borderRadius: 20, padding: "8px 16px", fontSize: 13, fontFamily: "inherit", color: "#0F3154", outline: "none", background: "#fff", width: 200 }}
          />
          {/* List / Pipeline toggle */}
          <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 10, padding: 3, gap: 2 }}>
            {(["list", "pipeline"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                background: view === v ? "#fff" : "none",
                color: view === v ? "#0F3154" : "#94a3b8",
                border: "none", borderRadius: 7, padding: "5px 14px",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s", textTransform: "capitalize",
              }}>{v === "list" ? "☰ List" : "⬛ Pipeline"}</button>
            ))}
          </div>
          <button onClick={() => { setShowAdd(v => !v); setTimeout(() => nameRef.current?.focus(), 50); }}
            style={{ background: "#DC373E", color: "#fff", border: "none", borderRadius: 20, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            + Add Client
          </button>
        </div>
      </div>

      {/* Add client form */}
      {showAdd && (
        <div style={{ ...card, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7D8E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>New Client</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input ref={nameRef} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name *"
              onKeyDown={e => { if (e.key === "Enter") addClient(); if (e.key === "Escape") setShowAdd(false); }}
              style={{ flex: "1 1 140px", border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 13px", fontSize: 13, fontFamily: "inherit", color: "#0F3154", outline: "none" }} />
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email"
              style={{ flex: "1 1 160px", border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 13px", fontSize: 13, fontFamily: "inherit", color: "#0F3154", outline: "none" }} />
            <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Phone"
              style={{ flex: "1 1 120px", border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 13px", fontSize: 13, fontFamily: "inherit", color: "#0F3154", outline: "none" }} />
            <input value={newTeam} onChange={e => setNewTeam(e.target.value)} placeholder="Team"
              style={{ flex: "1 1 120px", border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 13px", fontSize: 13, fontFamily: "inherit", color: "#0F3154", outline: "none" }} />
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
              style={{ border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 13px", fontSize: 13, fontFamily: "inherit", color: "#0F3154", outline: "none", background: "#fff" }}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={addClient} style={{ background: "#0F3154", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Add</button>
            <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", color: "#6B7D8E", fontSize: 20, cursor: "pointer" }}>×</button>
          </div>
        </div>
      )}

      {/* ── PIPELINE VIEW ── */}
      {view === "pipeline" && (
        <div style={{ overflowX: "auto", paddingBottom: 12 }}>
          <div style={{ display: "flex", gap: 14, minWidth: STATUSES.length * 200, alignItems: "flex-start" }}>
            {STATUSES.map(status => {
              const col = visibleClients.filter(c => (c.status || "Lead") === status);
              const color = STATUS_COLORS[status] || "#94a3b8";
              const isDragTarget = pipelineDragOver === status;
              return (
                <div key={status}
                  onDragOver={e => { e.preventDefault(); setPipelineDragOver(status); }}
                  onDragLeave={() => setPipelineDragOver(null)}
                  onDrop={e => {
                    e.preventDefault();
                    setPipelineDragOver(null);
                    const id = Number(e.dataTransfer.getData("clientId"));
                    if (!id) return;
                    updateClient(id, "status", status);
                  }}
                  style={{
                    flex: "0 0 200px", background: isDragTarget ? color + "12" : "#F8FAFC",
                    borderRadius: 14, border: isDragTarget ? `2px solid ${color}` : "2px solid #E1E8EF",
                    transition: "border 0.15s, background 0.15s", minHeight: 120,
                  }}>
                  {/* Column header */}
                  <div style={{ padding: "12px 14px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#0F3154", textTransform: "uppercase", letterSpacing: "0.07em" }}>{status}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", background: "#E1E8EF", borderRadius: 10, padding: "1px 8px" }}>{col.length}</span>
                  </div>

                  {/* Cards */}
                  <div style={{ padding: "0 10px 10px" }}>
                    {col.length === 0 && (
                      <div style={{ fontSize: 12, color: "#CBD5E1", textAlign: "center", padding: "20px 0", fontStyle: "italic" }}>Drop here</div>
                    )}
                    {col.map(client => {
                      const openItems = client.activities.filter(a => !a.completed).length;
                      const doneItems = client.activities.filter(a => a.completed).length;
                      return (
                        <div key={client.id}
                          draggable
                          onDragStart={e => { e.dataTransfer.setData("clientId", String(client.id)); }}
                          style={{
                            background: "#fff", borderRadius: 10, border: "1px solid #E1E8EF",
                            padding: "12px 13px", marginBottom: 8, cursor: "grab",
                            boxShadow: "0 1px 4px rgba(15,49,84,0.06)",
                            transition: "box-shadow 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(15,49,84,0.12)")}
                          onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,49,84,0.06)")}
                        >
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F3154", marginBottom: 3, lineHeight: 1.3 }}>{client.name}</div>
                          {client.team && (
                            <div style={{ fontSize: 11, color: "#0891b2", fontWeight: 600, marginBottom: 6 }}>{client.team}</div>
                          )}
                          {client.email && (
                            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.email}</div>
                          )}
                          {client.notes && (
                            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{client.notes}</div>
                          )}
                          {(openItems > 0 || doneItems > 0) && (
                            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                              {openItems > 0 && (
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", background: "#fef3c7", borderRadius: 6, padding: "2px 7px" }}>
                                  {openItems} open
                                </span>
                              )}
                              {doneItems > 0 && (
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#dcfce7", borderRadius: 6, padding: "2px 7px" }}>
                                  {doneItems} done
                                </span>
                              )}
                            </div>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10, borderTop: "1px solid #F1F5F9", paddingTop: 8 }}>
                            {STATUSES.filter(s => s !== status).map(s => (
                              <button key={s} onClick={() => updateClient(client.id, "status", s)}
                                style={{
                                  fontSize: 10, fontWeight: 700, color: STATUS_COLORS[s] || "#94a3b8",
                                  background: (STATUS_COLORS[s] || "#94a3b8") + "15",
                                  border: "none", borderRadius: 6, padding: "2px 8px",
                                  cursor: "pointer", fontFamily: "inherit",
                                }}>
                                → {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === "list" && visibleClients.length === 0 ? (
        <div style={{ ...card, padding: "48px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
          {q ? "No clients match your search." : <>No clients yet — click <strong style={{ color: "#DC373E" }}>+ Add Client</strong></>}
        </div>
      ) : view === "list" && (
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 660 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {/* drag handle col */}
                  <th style={{ ...th, width: 24, padding: "10px 4px 10px 12px" }} />
                  <th style={{ ...th, width: 32 }} />
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Phone</th>
                  <th style={th}>Team</th>
                  <th style={th}>Status</th>
                  <th style={th}>Notes</th>
                  <th style={{ ...th, whiteSpace: "nowrap" }}>Contact Date</th>
                  <th style={{ ...th, width: 32 }} />
                </tr>
              </thead>
              <tbody>
                {visibleClients.map((client, i) => {
                  const filter = getFilter(client.id);
                  const openCount = client.activities.filter(a => !a.completed).length;
                  const doneCount = client.activities.filter(a => a.completed).length;
                  const visibleActs = client.activities.filter(a =>
                    filter === "open" ? !a.completed : a.completed
                  );

                  const isDragTarget = listDragOver === i && listDragSrc !== i;
                  const isDragSrc = listDragSrc === i;

                  return (
                    <React.Fragment key={client.id}>
                      <tr
                        draggable={canDrag}
                        onDragStart={e => {
                          setListDragSrc(i);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={e => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          if (listDragOver !== i) setListDragOver(i);
                        }}
                        onDragLeave={() => setListDragOver(null)}
                        onDrop={e => {
                          e.preventDefault();
                          if (listDragSrc !== null) moveClient(listDragSrc, i);
                          setListDragSrc(null);
                          setListDragOver(null);
                        }}
                        onDragEnd={() => { setListDragSrc(null); setListDragOver(null); }}
                        style={{
                          borderTop: isDragTarget
                            ? "2px solid #0891b2"
                            : i === 0 ? "none" : "1px solid #F1F5F9",
                          background: isDragSrc ? "#F0F9FF" : expanded.has(client.id) ? "#F8FAFF" : "white",
                          opacity: isDragSrc ? 0.5 : 1,
                          transition: "opacity 0.1s, background 0.1s",
                        }}
                      >
                        {/* Drag handle */}
                        <td style={{ padding: "0 4px 0 12px", verticalAlign: "middle", lineHeight: 1 }}>
                          <span
                            title={canDrag ? "Drag to reorder" : ""}
                            style={{
                              display: "block", textAlign: "center",
                              fontSize: 15, color: canDrag ? "#CBD5E1" : "transparent",
                              cursor: canDrag ? "grab" : "default",
                              userSelect: "none", lineHeight: 1,
                            }}
                          >⠿</span>
                        </td>
                        {/* Expand toggle */}
                        <td style={{ padding: "0 6px 0 4px", verticalAlign: "middle" }}>
                          <button onClick={() => toggleExpand(client.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 11, padding: "10px 4px", lineHeight: 1 }}>
                            {expanded.has(client.id) ? "▼" : "▶"}
                          </button>
                        </td>
                        <td style={{ padding: "8px 14px", verticalAlign: "middle", minWidth: 120 }}>
                          <EditableCell value={client.name} onSave={v => updateClient(client.id, "name", v)} placeholder="Name" />
                        </td>
                        <td style={{ padding: "8px 14px", verticalAlign: "middle", minWidth: 160 }}>
                          <EditableCell value={client.email || ""} onSave={v => updateClient(client.id, "email", v)} placeholder="Email" type="email" />
                        </td>
                        <td style={{ padding: "8px 14px", verticalAlign: "middle", minWidth: 120 }}>
                          <EditableCell value={client.phone || ""} onSave={v => updateClient(client.id, "phone", v)} placeholder="Phone" type="tel" />
                        </td>
                        <td style={{ padding: "8px 14px", verticalAlign: "middle", minWidth: 120 }}>
                          <EditableCell value={client.team || ""} onSave={v => updateClient(client.id, "team", v)} placeholder="Team" />
                        </td>
                        <td style={{ padding: "8px 14px", verticalAlign: "middle" }}>
                          <select value={client.status || "Lead"}
                            onChange={e => updateClient(client.id, "status", e.target.value)}
                            style={{ border: "none", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", outline: "none", background: (STATUS_COLORS[client.status] || "#94a3b8") + "18", color: STATUS_COLORS[client.status] || "#94a3b8" }}>
                            {STATUSES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px 14px", verticalAlign: "middle", minWidth: 160 }}>
                          <EditableCell value={client.notes || ""} onSave={v => updateClient(client.id, "notes", v)} placeholder="Notes" />
                        </td>
                        <td style={{ padding: "8px 14px", verticalAlign: "middle", minWidth: 130 }}>
                          <EditableCell value={client.contact_date ? client.contact_date.slice(0, 10) : ""} onSave={v => updateClient(client.id, "contact_date", v)} placeholder="Date" type="date" />
                        </td>
                        <td style={{ padding: "8px 14px", verticalAlign: "middle", textAlign: "right" }}>
                          <button onClick={() => deleteClient(client.id)}
                            style={{ background: "none", border: "none", color: "#CBD5E1", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: "2px 4px" }}>×</button>
                        </td>
                      </tr>

                      {/* Expanded action items — renders inline directly below this client row */}
                      {expanded.has(client.id) && (
                        <tr>
                          <td colSpan={10} style={{ padding: 0, borderTop: "1px solid #F1F5F9", background: "#F8FAFC" }}>

                            {/* Open / Completed tabs */}
                            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px 0 60px", borderBottom: "1px solid #F1F5F9" }}>
                              {(["open", "completed"] as const).map(f => (
                                <button key={f} onClick={() => setFilter(client.id, f)}
                                  style={{
                                    background: filter === f ? "#0F3154" : "none",
                                    color: filter === f ? "#fff" : "#94a3b8",
                                    border: "none", borderRadius: "6px 6px 0 0",
                                    padding: "5px 14px", fontSize: 11, fontWeight: 700,
                                    cursor: "pointer", fontFamily: "inherit",
                                    textTransform: "capitalize", letterSpacing: "0.04em",
                                    marginBottom: -1,
                                  }}>
                                  {f === "open" ? `Open${openCount > 0 ? ` (${openCount})` : ""}` : `Completed${doneCount > 0 ? ` (${doneCount})` : ""}`}
                                </button>
                              ))}
                            </div>

                            {/* Column sub-headers */}
                            <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 110px 28px", padding: "5px 14px 4px 60px", borderBottom: "1px solid #F1F5F9" }}>
                              {["", "Item", "Notes", filter === "completed" ? "Completed" : "Due Date", ""].map((h, hi) => (
                                <div key={hi} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", padding: "0 6px" }}>{h}</div>
                              ))}
                            </div>

                            {/* Rows */}
                            <div style={{ padding: "4px 14px 10px 60px" }}>
                              {visibleActs.length === 0 && (
                                <div style={{ fontSize: 12, color: "#CBD5E1", padding: "8px 6px", fontStyle: "italic" }}>
                                  {filter === "open" ? "No open action items." : "No completed items yet."}
                                </div>
                              )}
                              {visibleActs.map(act => (
                                <div key={act.id} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 110px 28px", alignItems: "center", borderBottom: "1px solid #F1F5F9", minHeight: 34 }}>
                                  <div style={{ padding: "0 6px" }}>
                                    <button onClick={() => toggleComplete(client.id, act.id, act.completed)}
                                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}>
                                      <span style={{
                                        width: 15, height: 15, borderRadius: 3,
                                        border: act.completed ? "none" : "1.5px solid #CBD5E1",
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        background: act.completed ? "#16a34a" : "#fff", flexShrink: 0,
                                        transition: "background 0.15s",
                                      }}>
                                        {act.completed && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                      </span>
                                    </button>
                                  </div>
                                  <div style={{ padding: "4px 6px", opacity: act.completed ? 0.45 : 1 }}>
                                    <EditableCell value={act.text} onSave={v => updateActivity(client.id, act.id, "text", v)} placeholder="Item" />
                                  </div>
                                  <div style={{ padding: "4px 6px", opacity: act.completed ? 0.45 : 1 }}>
                                    <EditableCell value={act.notes || ""} onSave={v => updateActivity(client.id, act.id, "notes", v)} placeholder="Notes" />
                                  </div>
                                  <div style={{ padding: "4px 6px", opacity: act.completed ? 0.45 : 1 }}>
                                    {filter === "completed" && act.completed_at ? (
                                      <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, padding: "4px 0" }}>
                                        {new Date(act.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                      </div>
                                    ) : (
                                      <EditableCell value={act.due_date ? act.due_date.slice(0, 10) : ""} onSave={v => updateActivity(client.id, act.id, "due_date", v)} placeholder="Date" type="date" />
                                    )}
                                  </div>
                                  <div style={{ padding: "0 4px", textAlign: "right" }}>
                                    <button onClick={() => deleteActivity(client.id, act.id)}
                                      style={{ background: "none", border: "none", color: "#CBD5E1", fontSize: 14, cursor: "pointer", lineHeight: 1, padding: "2px" }}>×</button>
                                  </div>
                                </div>
                              ))}

                              {/* Add row — only on Open tab */}
                              {filter === "open" && (
                                <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 110px 28px", alignItems: "center", paddingTop: 8 }}>
                                  <div />
                                  <div style={{ padding: "0 4px" }}>
                                    <input
                                      value={getNewAct(client.id).text}
                                      onChange={e => setNewActivity(p => ({ ...p, [client.id]: { ...getNewAct(client.id), text: e.target.value } }))}
                                      onKeyDown={e => { if (e.key === "Enter") addActivity(client.id); }}
                                      placeholder="Item..."
                                      style={{ width: "100%", border: "1px solid #E1E8EF", borderRadius: 6, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", color: "#0F3154", outline: "none", background: "#fff", boxSizing: "border-box" }}
                                    />
                                  </div>
                                  <div style={{ padding: "0 4px" }}>
                                    <input
                                      value={getNewAct(client.id).notes}
                                      onChange={e => setNewActivity(p => ({ ...p, [client.id]: { ...getNewAct(client.id), notes: e.target.value } }))}
                                      placeholder="Notes..."
                                      style={{ width: "100%", border: "1px solid #E1E8EF", borderRadius: 6, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", color: "#0F3154", outline: "none", background: "#fff", boxSizing: "border-box" }}
                                    />
                                  </div>
                                  <div style={{ padding: "0 4px" }}>
                                    <input
                                      type="date"
                                      value={getNewAct(client.id).due_date}
                                      onChange={e => setNewActivity(p => ({ ...p, [client.id]: { ...getNewAct(client.id), due_date: e.target.value } }))}
                                      style={{ width: "100%", border: "1px solid #E1E8EF", borderRadius: 6, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", color: "#0F3154", outline: "none", background: "#fff", boxSizing: "border-box" }}
                                    />
                                  </div>
                                  <div style={{ padding: "0 4px" }}>
                                    <button onClick={() => addActivity(client.id)}
                                      style={{ background: "#0F3154", color: "#fff", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>+</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
