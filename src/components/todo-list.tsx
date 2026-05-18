"use client";

import { useState, useEffect, useRef } from "react";

interface TodoItem {
  id: number;
  text: string;
  notes?: string;
  done: boolean;
}

interface TodoListProps {
  projectMode?: boolean;
  storageKey: string;
}

export function TodoList({ projectMode = false, storageKey }: TodoListProps) {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [input, setInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/focus/todos?key=${storageKey}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [storageKey]);

  const addItem = async () => {
    const text = input.trim();
    if (!text) { inputRef.current?.focus(); return; }
    const notes = notesInput.trim();
    const res = await fetch("/api/focus/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, notes: notes || undefined, key: storageKey }),
    }).then(r => r.json());
    if (res.id) {
      setItems(prev => [...prev, { id: res.id, text, notes: res.notes, done: false }]);
    }
    setInput("");
    setNotesInput("");
    setShowNotes(false);
    inputRef.current?.focus();
  };

  const toggleDone = async (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const done = !item.done;
    setItems(prev => prev.map(i => i.id === id ? { ...i, done } : i));
    fetch("/api/focus/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    }).catch(() => {});
  };

  const deleteItem = async (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    fetch(`/api/focus/todos?id=${id}`, { method: "DELETE" }).catch(() => {});
  };

  const toggleNotes = (id: number) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const visible = hideCompleted ? items.filter(i => !i.done) : items;
  const doneCount = items.filter(i => i.done).length;

  return (
    <div style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
      <style>{`
        .todo-del:hover { color: #DC373E !important; }
        .todo-add-btn:hover { background: #C42F36 !important; }
        .todo-item-row:hover .todo-del { opacity: 1 !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7D8E", marginBottom: 4, fontWeight: 500 }}>
          {projectMode ? "Project" : "Todo"}
        </div>
        <h2 style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 26, fontWeight: 700, color: "#0F3154", lineHeight: 1.15, margin: 0 }}>
          {projectMode ? "Project notes." : "What's next?"}
        </h2>
      </div>

      {/* Input */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 0, border: "1px solid #E1E8EF", borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 1px 4px rgba(15,49,84,0.06)", marginBottom: showNotes ? 0 : 0 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addItem(); }}
            placeholder={projectMode ? "Add a task or note..." : "Add a todo item..."}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "11px 14px", fontFamily: "inherit", fontSize: 14, color: "#0F3154" }}
          />
          {projectMode && (
            <button
              onClick={() => setShowNotes(v => !v)}
              style={{ border: "none", borderLeft: "1px solid #E1E8EF", padding: "11px 12px", background: "transparent", cursor: "pointer", fontSize: 13, color: showNotes ? "#0F3154" : "#6B7D8E", fontFamily: "inherit" }}
              title="Add notes"
            >
              📝
            </button>
          )}
          <button
            onClick={addItem}
            className="todo-add-btn"
            style={{ background: "#DC373E", border: "none", padding: "11px 18px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap" }}
          >
            + Add
          </button>
        </div>
        {projectMode && showNotes && (
          <textarea
            value={notesInput}
            onChange={e => setNotesInput(e.target.value)}
            placeholder="Notes (optional)..."
            rows={3}
            style={{ width: "100%", marginTop: 6, border: "1px solid #E1E8EF", borderRadius: 8, padding: "10px 14px", fontFamily: "inherit", fontSize: 13, color: "#0F3154", outline: "none", resize: "vertical", boxSizing: "border-box", background: "#fff" }}
          />
        )}
      </div>

      {/* Controls */}
      {items.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #E1E8EF" }}>
          <span style={{ fontSize: 12, color: "#6B7D8E" }}>
            {items.length} item{items.length !== 1 ? "s" : ""}{doneCount > 0 ? ` · ${doneCount} done` : ""}
          </span>
          {doneCount > 0 && (
            <button
              onClick={() => setHideCompleted(v => !v)}
              style={{ fontSize: 12, color: "#6B7D8E", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              {hideCompleted ? "Show completed" : "Hide completed"}
            </button>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ fontSize: 14, color: "#6B7D8E", padding: "16px 0" }}>Loading...</div>
      ) : visible.length === 0 && items.length === 0 ? (
        <div style={{ fontSize: 14, color: "#6B7D8E", textAlign: "center", padding: "36px 0" }}>
          {projectMode ? "No project tasks yet." : "All clear — nothing to do!"}
        </div>
      ) : visible.length === 0 ? (
        <div style={{ fontSize: 14, color: "#6B7D8E", textAlign: "center", padding: "24px 0" }}>
          All completed items are hidden.
        </div>
      ) : (
        <div>
          {visible.map((item) => (
            <div key={item.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
              <div className="todo-item-row" style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 4px" }}>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleDone(item.id)}
                  style={{ accentColor: "#DC373E", width: 15, height: 15, marginTop: 2, flexShrink: 0, cursor: "pointer" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: item.done ? "#94a3b8" : "#0F3154", textDecoration: item.done ? "line-through" : "none", lineHeight: 1.4 }}>
                    {item.text}
                  </div>
                  {projectMode && item.notes && (
                    <>
                      <button
                        onClick={() => toggleNotes(item.id)}
                        style={{ fontSize: 11, color: "#6B7D8E", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, marginTop: 2 }}
                      >
                        {expandedNotes.has(item.id) ? "▲ hide notes" : "▼ show notes"}
                      </button>
                      {expandedNotes.has(item.id) && (
                        <div style={{ fontSize: 12, color: "#6B7D8E", marginTop: 4, padding: "8px 10px", background: "#F8FAFC", borderRadius: 6, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                          {item.notes}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="todo-del"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", fontSize: 17, lineHeight: 1, padding: "0 3px", transition: "color 0.15s", opacity: 0.6, flexShrink: 0 }}
                  title="Delete"
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
