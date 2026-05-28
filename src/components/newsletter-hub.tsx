"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
type EntryType = "heading" | "paragraph" | "bullet" | "divider" | "cta";
type NLStatus = "Draft" | "Scheduled" | "Sent";

interface Entry {
  id: number;
  newsletter_id: number;
  type: EntryType;
  content: string;
  sort_order: number;
}

interface Newsletter {
  id: number;
  title: string;
  subject: string | null;
  preview_text: string | null;
  status: NLStatus;
  sequence: number | null;
  notes: string | null;
  created_at: string;
  entries: Entry[];
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "#fff", borderRadius: 14, border: "1px solid #E1E8EF",
  boxShadow: "0 2px 8px rgba(15,49,84,0.05)",
};
const btn = (bg: string, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  background: bg, color, border: "none", borderRadius: 8, padding: "7px 14px",
  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", ...extra,
});
const STATUS_COLOR: Record<NLStatus, { bg: string; color: string }> = {
  Draft:     { bg: "#F1F5F9", color: "#64748b" },
  Scheduled: { bg: "#FEF3C7", color: "#92400e" },
  Sent:      { bg: "#F0FDF4", color: "#15803d" },
};
const ENTRY_TYPES: { id: EntryType; label: string; icon: string }[] = [
  { id: "heading",   label: "Heading",    icon: "H" },
  { id: "paragraph", label: "Paragraph",  icon: "¶" },
  { id: "bullet",    label: "Bullet",     icon: "•" },
  { id: "divider",   label: "Divider",    icon: "─" },
  { id: "cta",       label: "Button/CTA", icon: "→" },
];

async function apiFetch(url: string, method = "GET", body?: object) {
  const res = await fetch(url, {
    method, headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

// ── Entry row ─────────────────────────────────────────────────────────────────
function EntryRow({
  entry, index, total, onUpdate, onDelete, onMove,
}: {
  entry: Entry; index: number; total: number;
  onUpdate: (id: number, field: "type" | "content", val: string) => void;
  onDelete: (id: number) => void;
  onMove: (id: number, dir: "up" | "down") => void;
}) {
  const isDivider = entry.type === "divider";
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
      {/* Move arrows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 2, flexShrink: 0 }}>
        <button onClick={() => onMove(entry.id, "up")} disabled={index === 0}
          style={{ ...btn("#F1F5F9", "#64748b", { padding: "2px 6px", fontSize: 10, opacity: index === 0 ? 0.3 : 1 }) }}>▲</button>
        <button onClick={() => onMove(entry.id, "down")} disabled={index === total - 1}
          style={{ ...btn("#F1F5F9", "#64748b", { padding: "2px 6px", fontSize: 10, opacity: index === total - 1 ? 0.3 : 1 }) }}>▼</button>
      </div>
      {/* Type selector */}
      <select value={entry.type} onChange={e => onUpdate(entry.id, "type", e.target.value)}
        style={{ fontSize: 11, fontWeight: 700, border: "1px solid #E1E8EF", borderRadius: 6, padding: "4px 6px", color: "#0F3154", background: "#F8FAFC", flexShrink: 0, cursor: "pointer" }}>
        {ENTRY_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
      </select>
      {/* Content */}
      {isDivider ? (
        <div style={{ flex: 1, borderTop: "2px dashed #E1E8EF", marginTop: 12 }} />
      ) : (
        <textarea
          value={entry.content}
          onChange={e => onUpdate(entry.id, "content", e.target.value)}
          placeholder={
            entry.type === "cta" ? "Button label | URL" :
            entry.type === "heading" ? "Section heading…" : "Write content…"
          }
          rows={entry.type === "paragraph" ? 3 : 1}
          style={{
            flex: 1, border: "1px solid #E1E8EF", borderRadius: 8, padding: "8px 10px",
            fontSize: entry.type === "heading" ? 15 : 13,
            fontWeight: entry.type === "heading" ? 700 : 400,
            color: "#0F3154", resize: "vertical", fontFamily: "inherit", outline: "none",
            background: "#FAFBFC",
          }}
        />
      )}
      <button onClick={() => onDelete(entry.id)}
        style={{ ...btn("#FEF2F2", "#dc2626", { padding: "4px 9px", fontSize: 13, flexShrink: 0, marginTop: 2 }) }}>✕</button>
    </div>
  );
}

// ── Newsletter editor ─────────────────────────────────────────────────────────
function NewsletterEditor({ nl, onBack, onSaved }: {
  nl: Newsletter;
  onBack: () => void;
  onSaved: (updated: Newsletter) => void;
}) {
  const [title, setTitle]     = useState(nl.title);
  const [subject, setSubject] = useState(nl.subject || "");
  const [preview, setPreview] = useState(nl.preview_text || "");
  const [status, setStatus]   = useState<NLStatus>(nl.status);
  const [notes, setNotes]     = useState(nl.notes || "");
  const [entries, setEntries] = useState<Entry[]>([...nl.entries].sort((a, b) => a.sort_order - b.sort_order));
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const saveHeader = useCallback(async () => {
    setSaving(true);
    await apiFetch("/api/focus/newsletters", "PATCH", {
      id: nl.id, title, subject, preview_text: preview, status,
      sequence: nl.sequence, notes,
    });
    setSaving(false);
    setSaveMsg("Saved ✓");
    setTimeout(() => setSaveMsg(""), 2500);
    onSaved({ ...nl, title, subject: subject || null, preview_text: preview || null, status, notes: notes || null, entries });
  }, [nl, title, subject, preview, status, notes, entries, onSaved]);

  const addEntry = async (type: EntryType) => {
    const nextOrder = entries.length > 0 ? Math.max(...entries.map(e => e.sort_order)) + 1 : 0;
    const created = await apiFetch("/api/focus/newsletters/entries", "POST", {
      newsletter_id: nl.id, type, content: "", sort_order: nextOrder,
    });
    setEntries(prev => [...prev, created]);
  };

  const updateEntry = useCallback((id: number, field: "type" | "content", val: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e));
  }, []);

  const persistEntry = useCallback(async (entry: Entry) => {
    await apiFetch("/api/focus/newsletters/entries", "PATCH", {
      id: entry.id, type: entry.type, content: entry.content, sort_order: entry.sort_order,
    });
  }, []);

  const deleteEntry = useCallback(async (id: number) => {
    await apiFetch("/api/focus/newsletters/entries", "DELETE", { id });
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const moveEntry = useCallback((id: number, dir: "up" | "down") => {
    setEntries(prev => {
      const sorted = [...prev].sort((a, b) => a.sort_order - b.sort_order);
      const idx = sorted.findIndex(e => e.id === id);
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const newArr = sorted.map(e => ({ ...e }));
      const tmp = newArr[idx].sort_order;
      newArr[idx].sort_order = newArr[swapIdx].sort_order;
      newArr[swapIdx].sort_order = tmp;
      apiFetch("/api/focus/newsletters/entries", "PATCH", { id: newArr[idx].id, type: newArr[idx].type, content: newArr[idx].content, sort_order: newArr[idx].sort_order });
      apiFetch("/api/focus/newsletters/entries", "PATCH", { id: newArr[swapIdx].id, type: newArr[swapIdx].type, content: newArr[swapIdx].content, sort_order: newArr[swapIdx].sort_order });
      return newArr;
    });
  }, []);

  const sortedEntries = [...entries].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ ...btn("#F1F5F9", "#0F3154"), fontSize: 13 }}>← Back</button>
        <div style={{ flex: 1, fontSize: 18, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)" }}>Edit Newsletter</div>
        <select value={status} onChange={e => setStatus(e.target.value as NLStatus)}
          style={{ fontSize: 12, fontWeight: 700, border: "1px solid #E1E8EF", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
          {(["Draft", "Scheduled", "Sent"] as NLStatus[]).map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={saveHeader} disabled={saving} style={{ ...btn("#0F3154", "#fff"), opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : "Save"}
        </button>
        {saveMsg && <span style={{ fontSize: 12, color: "#15803d", fontWeight: 700 }}>{saveMsg}</span>}
      </div>

      {/* Header fields */}
      <div style={{ ...card, padding: 20, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>Newsletter Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. June Update — Summer Training Tips"
            style={{ width: "100%", border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 12px", fontSize: 15, fontWeight: 700, color: "#0F3154", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Email Subject Line</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject shown in inbox…"
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Preview Text</label>
            <input value={preview} onChange={e => setPreview(e.target.value)} placeholder="Short teaser below subject…"
              style={inputStyle} />
          </div>
        </div>
        {/* Notes field */}
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes for this newsletter…" rows={2}
            style={{ ...inputStyle, resize: "vertical", width: "100%", boxSizing: "border-box" } as React.CSSProperties} />
        </div>
      </div>

      {/* Entries */}
      <div style={{ ...card, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F3154", marginBottom: 14 }}>Content Blocks ({sortedEntries.length})</div>
        {sortedEntries.length === 0 && (
          <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>
            No content yet — add your first block below.
          </div>
        )}
        {sortedEntries.map((entry, i) => (
          <EntryRow
            key={entry.id} entry={entry} index={i} total={sortedEntries.length}
            onUpdate={updateEntry} onDelete={deleteEntry} onMove={moveEntry}
          />
        ))}
      </div>

      {/* Add block buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>Add block:</span>
        {ENTRY_TYPES.map(t => (
          <button key={t.id} onClick={() => addEntry(t.id)}
            style={{ ...btn("#F1F5F9", "#0F3154", { fontSize: 12, padding: "6px 12px" }) }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Inline sequence cell ──────────────────────────────────────────────────────
function SequenceCell({ nl, onUpdate }: { nl: Newsletter; onUpdate: (n: Newsletter) => void }) {
  const [val, setVal] = useState(nl.sequence != null ? String(nl.sequence) : "");

  const save = async () => {
    const num = val === "" ? null : parseInt(val, 10);
    if (val !== "" && isNaN(num as number)) return;
    await apiFetch("/api/focus/newsletters", "PATCH", {
      id: nl.id, title: nl.title, subject: nl.subject, preview_text: nl.preview_text,
      status: nl.status, sequence: num, notes: nl.notes,
    });
    onUpdate({ ...nl, sequence: num });
  };

  return (
    <input
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={e => e.key === "Enter" && e.currentTarget.blur()}
      onClick={e => e.stopPropagation()}
      placeholder="—"
      type="number"
      style={{ width: 56, border: "1px solid #E1E8EF", borderRadius: 6, padding: "4px 6px", fontSize: 13, fontWeight: 600, color: "#0F3154", textAlign: "center", outline: "none", background: "#FAFBFC" }}
    />
  );
}

// ── Inline notes cell ─────────────────────────────────────────────────────────
function NotesCell({ nl, onUpdate }: { nl: Newsletter; onUpdate: (n: Newsletter) => void }) {
  const [open, setOpen] = useState(false);
  const [val, setVal]   = useState(nl.notes || "");

  const save = async () => {
    await apiFetch("/api/focus/newsletters", "PATCH", {
      id: nl.id, title: nl.title, subject: nl.subject, preview_text: nl.preview_text,
      status: nl.status, sequence: nl.sequence, notes: val || null,
    });
    onUpdate({ ...nl, notes: val || null });
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(v => !v)}
        style={{ ...btn(open ? "#EFF6FF" : "#F8FAFC", open ? "#1d4ed8" : "#94a3b8", { padding: "3px 8px", fontSize: 11, border: "1px solid #E1E8EF" }) }}>
        {nl.notes ? "📝 Note" : "+ Note"}
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: "10px 12px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8 }}>
          <textarea
            autoFocus
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={save}
            rows={3}
            placeholder="Add a note about this newsletter…"
            style={{ width: "100%", border: "1px solid #FCD34D", borderRadius: 6, padding: "6px 8px", fontSize: 12, color: "#334155", resize: "vertical", outline: "none", background: "#FFFDE7", boxSizing: "border-box", fontFamily: "inherit" }}
          />
          {val && (
            <div style={{ fontSize: 11, color: "#92400e", marginTop: 4 }}>Saves on blur · blurs to save</div>
          )}
        </div>
      )}
      {!open && nl.notes && (
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {nl.notes}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function NewsletterHub() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState<Newsletter | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [newTitle, setNewTitle]       = useState("");
  const [creating, setCreating]       = useState(false);
  const [filterSeq, setFilterSeq]     = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | NLStatus>("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch("/api/focus/newsletters");
    setNewsletters(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createNewsletter = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const created = await apiFetch("/api/focus/newsletters", "POST", { title: newTitle.trim() });
    setNewsletters(prev => [created, ...prev]);
    setNewTitle("");
    setShowForm(false);
    setCreating(false);
    setEditing(created);
  };

  const deleteNewsletter = async (id: number) => {
    if (!confirm("Delete this newsletter and all its content?")) return;
    await apiFetch("/api/focus/newsletters", "DELETE", { id });
    setNewsletters(prev => prev.filter(n => n.id !== id));
  };

  const onSaved = useCallback((updated: Newsletter) => {
    setNewsletters(prev => prev.map(n => n.id === updated.id ? updated : n));
    setEditing(updated);
  }, []);

  const updateNL = useCallback((updated: Newsletter) => {
    setNewsletters(prev => prev.map(n => n.id === updated.id ? updated : n));
  }, []);

  const filtered = newsletters.filter(n => {
    const seqMatch  = filterSeq === "" || String(n.sequence ?? "").includes(filterSeq);
    const statMatch = filterStatus === "" || n.status === filterStatus;
    return seqMatch && statMatch;
  });

  if (editing) {
    return <NewsletterEditor nl={editing} onBack={() => { setEditing(null); load(); }} onSaved={onSaved} />;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)", marginBottom: 4 }}>Email Newsletters</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{newsletters.length} newsletter{newsletters.length !== 1 ? "s" : ""}</div>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{ ...btn("#0F3154", "#fff", { fontSize: 13, padding: "9px 18px" }) }}>
          {showForm ? "Cancel" : "+ New Newsletter"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{ ...card, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F3154", marginBottom: 10 }}>New Newsletter</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createNewsletter()}
              placeholder="Newsletter title (e.g. June 2026 — Summer Tips)"
              style={{ flex: 1, border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 12px", fontSize: 14, fontWeight: 600, color: "#0F3154", outline: "none" }}
            />
            <button onClick={createNewsletter} disabled={creating || !newTitle.trim()}
              style={{ ...btn("#0F3154", "#fff"), opacity: (creating || !newTitle.trim()) ? 0.5 : 1 }}>
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>Filter:</span>
        <input value={filterSeq} onChange={e => setFilterSeq(e.target.value)} placeholder="Sequence #"
          style={{ width: 110, border: "1px solid #E1E8EF", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "#0F3154", outline: "none" }}
          type="number"
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as "" | NLStatus)}
          style={{ border: "1px solid #E1E8EF", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "#334155", cursor: "pointer" }}>
          <option value="">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Sent">Sent</option>
        </select>
        {(filterSeq || filterStatus) && (
          <button onClick={() => { setFilterSeq(""); setFilterStatus(""); }}
            style={{ ...btn("#F1F5F9", "#64748b", { fontSize: 11 }) }}>Clear</button>
        )}
        <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>
          {filtered.length} of {newsletters.length} shown
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 40 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          {newsletters.length === 0
            ? "No newsletters yet — create your first one above."
            : "No newsletters match your filter."}
        </div>
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={th()}>Seq #</th>
                <th style={th()}>Title</th>
                <th style={th()}>Subject</th>
                <th style={th()}>Status</th>
                <th style={th()}>Blocks</th>
                <th style={th()}>Notes</th>
                <th style={th()}>Created</th>
                <th style={th()}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(n => (
                <tr key={n.id}>
                  {/* Seq — inline edit, no row click */}
                  <td style={td()} onClick={e => e.stopPropagation()}>
                    <SequenceCell nl={n} onUpdate={updateNL} />
                  </td>
                  {/* Title — click to open editor */}
                  <td style={{ ...td(), cursor: "pointer", fontWeight: 700, color: "#0F3154", maxWidth: 240 }} onClick={() => setEditing(n)}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</div>
                  </td>
                  <td style={{ ...td(), color: "#64748b", maxWidth: 200, cursor: "pointer" }} onClick={() => setEditing(n)}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {n.subject || <span style={{ color: "#cbd5e1" }}>—</span>}
                    </div>
                  </td>
                  <td style={{ ...td(), cursor: "pointer" }} onClick={() => setEditing(n)}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 10, cursor: "pointer",
                      background: STATUS_COLOR[n.status]?.bg || "#F1F5F9",
                      color: STATUS_COLOR[n.status]?.color || "#64748b" }}>
                      {n.status}
                    </span>
                  </td>
                  <td style={{ ...td(), textAlign: "center", cursor: "pointer" }} onClick={() => setEditing(n)}>
                    {n.entries.length}
                  </td>
                  {/* Notes — inline, no row click */}
                  <td style={td()} onClick={e => e.stopPropagation()}>
                    <NotesCell nl={n} onUpdate={updateNL} />
                  </td>
                  <td style={{ ...td(), color: "#94a3b8", whiteSpace: "nowrap", cursor: "pointer" }} onClick={() => setEditing(n)}>
                    {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={td()} onClick={e => e.stopPropagation()}>
                    <button onClick={() => deleteNewsletter(n.id)}
                      style={{ ...btn("#FEF2F2", "#dc2626", { padding: "4px 8px", fontSize: 11 }) }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Style utils ───────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
  letterSpacing: "0.07em", display: "block", marginBottom: 4,
};
const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid #E1E8EF", borderRadius: 8, padding: "8px 12px",
  fontSize: 13, color: "#334155", outline: "none", background: "#FAFBFC",
  boxSizing: "border-box", fontFamily: "inherit",
};
function th(extra?: React.CSSProperties): React.CSSProperties {
  return { padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", whiteSpace: "nowrap", ...extra };
}
function td(extra?: React.CSSProperties): React.CSSProperties {
  return { padding: "11px 14px", verticalAlign: "middle", fontSize: 13, color: "#334155", borderTop: "1px solid #F1F5F9", ...extra };
}
