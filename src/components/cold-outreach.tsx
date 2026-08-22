"use client";

import { useEffect, useState } from "react";
import { COLD_EMAILS } from "@/lib/cold-emails";

type Club = {
  id: string;  // clubs.id is a text slug, not a number
  name: string;
  city: string | null;
  state: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  slug: string;
  status: string;
  email1_sent_at: string | null;
  email2_sent_at: string | null;
  email3_sent_at: string | null;
  email4_sent_at: string | null;
  email5_sent_at: string | null;
  notes: string | null;
};

// One touch's date, by number. Everything below reads through this rather than
// naming email1/2/3 by hand, so a sixth email is one entry in COLD_EMAILS and
// two columns — nothing here has to be found and edited again.
const sentAt = (c: Club, n: number) =>
  (c as unknown as Record<string, string | null>)[`email${n}_sent_at`] ?? null;

const STATUS_LABELS: Record<string, string> = {
  not_contacted: "Not contacted",
  sent_1: "Email 1 sent",
  sent_2: "Email 2 sent",
  sent_3: "Email 3 sent",
  sent_4: "Email 4 sent",
  sent_5: "Email 5 sent",
  replied: "Replied",
  claimed: "Claimed listing",
  not_interested: "Not interested",
};

const STATUS_COLOURS: Record<string, string> = {
  not_contacted: "#94a3b8",
  sent_1: "#0F3154",
  sent_2: "#0F3154",
  sent_3: "#0F3154",
  replied: "#15803d",
  claimed: "#15803d",
  not_interested: "#b91c1c",
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E1E8EF",
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
};

export function ColdOutreach() {
  const [tab, setTab] = useState<"clubs" | "sequence">("clubs");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [onlyWithEmail, setOnlyWithEmail] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sendMsg, setSendMsg] = useState<Record<string, string>>({});

  const sendEmail = async (club: Club, n: number) => {
    const key = `${club.id}:${n}`;
    if (sending) return;
    if (!confirm(`Send email ${n} to ${club.name} at ${club.email}?`)) return;
    setSending(key);
    setSendMsg(m => ({ ...m, [club.id]: "" }));
    try {
      const res = await fetch("/api/focus/cold/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId: club.id, emailNumber: n }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setSendMsg(m => ({ ...m, [club.id]: d.error || "Send failed." })); return; }
      const stamp = new Date().toISOString();
      setClubs(prev => prev.map(c => c.id === club.id
        ? { ...c, status: `sent_${n}`, [`email${n}_sent_at`]: stamp }
        : c));
      setSendMsg(m => ({ ...m, [club.id]: `✓ Email ${n} sent` }));
    } catch {
      setSendMsg(m => ({ ...m, [club.id]: "Send failed." }));
    } finally {
      setSending(null);
    }
  };

  useEffect(() => {
    fetch("/api/focus/cold")
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.clubs) setClubs(d.clubs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Saved on blur, one field at a time — a PATCH per keystroke races itself.
  const saveField = async (clubId: string, field: 'email' | 'website' | 'phone', value: string) => {
    setSaving(clubId);
    setClubs(prev => prev.map(c => (c.id === clubId ? { ...c, [field]: value } : c)));
    try {
      const res = await fetch("/api/focus/cold", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, [field]: value }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setSendMsg(m => ({ ...m, [clubId]: d.error || "Could not save that." }));
      }
    } catch {
      setSendMsg(m => ({ ...m, [clubId]: "Could not save that." }));
    } finally {
      setSaving(null);
    }
  };

  const setStatus = async (clubId: string, status: string) => {
    setSaving(clubId);
    setClubs(prev => prev.map(c => (c.id === clubId ? { ...c, status } : c)));
    try {
      await fetch("/api/focus/cold", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, status }),
      });
    } finally {
      setSaving(null);
    }
  };

  const shown = onlyWithEmail ? clubs.filter(c => c.email) : clubs;
  const counts = clubs.reduce<Record<string, number>>((a, c) => {
    a[c.status] = (a[c.status] || 0) + 1;
    return a;
  }, {});

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["clubs", "sequence"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 18px", fontSize: 14, fontWeight: 700, borderRadius: 999,
              border: "2px solid " + (tab === t ? "#0F3154" : "#E1E8EF"),
              background: tab === t ? "#0F3154" : "#fff",
              color: tab === t ? "#fff" : "#6B7D8E",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {t === "clubs" ? "Clubs" : "Sequence"}
          </button>
        ))}
      </div>

      {tab === "clubs" && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
            {Object.keys(STATUS_LABELS).map(s => (
              <span key={s} style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOURS[s] }}>
                {STATUS_LABELS[s]}: {counts[s] || 0}
              </span>
            ))}
            <label style={{ marginLeft: "auto", fontSize: 13, color: "#6B7D8E", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={onlyWithEmail} onChange={e => setOnlyWithEmail(e.target.checked)} />
              Only clubs with an email
            </label>
          </div>

          {loading && <p style={{ color: "#6B7D8E" }}>Loading clubs…</p>}
          {!loading && !shown.length && <p style={{ color: "#6B7D8E" }}>No clubs to show.</p>}

          {shown.map(c => (
            <div key={c.id} style={card}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
                <div style={{ minWidth: 200, flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: "#0F3154" }}>{c.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6B7D8E" }}>
                    {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                  </p>
                  {/* Editable here, and only here. The onboarding CRM mirrors
                      these and refuses writes to them, so each has exactly one
                      place it can change — which is what stops a sync between
                      the two ever overwriting somebody's work. */}
                  <div style={{ display: "grid", gap: 6, marginTop: 8, maxWidth: 420 }}>
                    <input
                      type="email"
                      defaultValue={c.email || ""}
                      placeholder="No email yet — add one"
                      onBlur={e => { if (e.target.value.trim() !== (c.email || "")) saveField(c.id, "email", e.target.value.trim()); }}
                      style={{
                        padding: "7px 10px", fontSize: 13, borderRadius: 8, fontFamily: "inherit",
                        border: `1px solid ${c.email ? "#E1E8EF" : "#fca5a5"}`,
                        color: "#0F3154", fontWeight: 600,
                        background: c.email ? "#fff" : "#fef2f2",
                      }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        defaultValue={c.website || ""}
                        placeholder="Website"
                        onBlur={e => { if (e.target.value.trim() !== (c.website || "")) saveField(c.id, "website", e.target.value.trim()); }}
                        style={{ flex: 2, minWidth: 0, padding: "7px 10px", fontSize: 13, borderRadius: 8, border: "1px solid #E1E8EF", color: "#6B7D8E", fontFamily: "inherit" }}
                      />
                      <input
                        defaultValue={c.phone || ""}
                        placeholder="Phone"
                        onBlur={e => { if (e.target.value.trim() !== (c.phone || "")) saveField(c.id, "phone", e.target.value.trim()); }}
                        style={{ flex: 1, minWidth: 0, padding: "7px 10px", fontSize: 13, borderRadius: 8, border: "1px solid #E1E8EF", color: "#6B7D8E", fontFamily: "inherit" }}
                      />
                    </div>
                    {c.website && (
                      <a
                        href={/^https?:\/\//i.test(c.website) ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 12, color: "#DC373E", fontWeight: 600 }}
                      >Open {c.website} &rarr;</a>
                    )}
                  </div>
                </div>

                <div style={{ minWidth: 190 }}>
                  <select
                    value={c.status}
                    onChange={e => setStatus(c.id, e.target.value)}
                    disabled={saving === c.id}
                    style={{
                      width: "100%", padding: "8px 10px", fontSize: 13, fontWeight: 700,
                      borderRadius: 8, border: "2px solid #E1E8EF", fontFamily: "inherit",
                      color: STATUS_COLOURS[c.status] || "#0F3154", background: "#fff",
                    }}
                  >
                    {Object.keys(STATUS_LABELS).map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "#94a3b8" }}>
                    {COLD_EMAILS.map((e, i) => {
                      const at = sentAt(c, e.n);
                      return (
                        <span key={e.n}>
                          {i > 0 ? "  ·  " : ""}
                          {at ? `E${e.n} ${String(at).slice(0, 10)}` : `E${e.n} —`}
                        </span>
                      );
                    })}
                  </p>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {COLD_EMAILS.map(({ n }) => {
                      const done = !!sentAt(c, n);
                      // 2 is a follow-up on 1's thread, so it cannot go first.
                      // 3, 4 and 5 each open on their own subject and stand
                      // alone, so none of them gates on what came before.
                      const blocked = !c.email || done || (n === 2 && !c.email1_sent_at);
                      return (
                        <button
                          key={n}
                          onClick={() => sendEmail(c, n)}
                          disabled={blocked || sending === `${c.id}:${n}`}
                          title={done ? "Already sent" : n === 2 && !c.email1_sent_at ? "Send email 1 first" : undefined}
                          style={{
                            flex: 1, padding: "6px 10px", fontSize: 12, fontWeight: 700, borderRadius: 8,
                            border: "2px solid " + (blocked ? "#E1E8EF" : "#0F3154"),
                            background: blocked ? "#f6f8fa" : "#0F3154",
                            color: blocked ? "#94a3b8" : "#fff",
                            cursor: blocked ? "not-allowed" : "pointer", fontFamily: "inherit",
                          }}
                        >
                          {sending === `${c.id}:${n}` ? "Sending…" : `Send ${n}`}
                        </button>
                      );
                    })}
                  </div>
                  {sendMsg[c.id] && (
                    <p style={{ margin: "6px 0 0", fontSize: 11, fontWeight: 700, color: sendMsg[c.id].startsWith("✓") ? "#15803d" : "#b91c1c" }}>
                      {sendMsg[c.id]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "sequence" && (
        <>
          <p style={{ color: "#6B7D8E", fontSize: 14, marginTop: 0 }}>
            Sent from the Clubs tab. Previewed here with a sample club name.
          </p>
          {COLD_EMAILS.map(e => (
            <div key={e.n} style={card}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>
                Email {e.n} · {e.timing}
              </p>
              <p style={{ margin: "6px 0 0", fontWeight: 700, color: "#0F3154" }}>{e.name}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#0F3154" }}>
                <strong>Subject:</strong> {e.subject("Example FC")}
              </p>
              <div
                style={{ marginTop: 12, padding: 14, background: "#f8fafc", border: "1px solid #E1E8EF", borderRadius: 8 }}
                dangerouslySetInnerHTML={{ __html: e.html("Example FC", "club@example.com") }}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
