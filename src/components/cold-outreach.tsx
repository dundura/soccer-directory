"use client";

import { useEffect, useState } from "react";

type Club = {
  id: number;
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
  notes: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  not_contacted: "Not contacted",
  sent_1: "Email 1 sent",
  sent_2: "Email 2 sent",
  replied: "Replied",
  claimed: "Claimed listing",
  not_interested: "Not interested",
};

const STATUS_COLOURS: Record<string, string> = {
  not_contacted: "#94a3b8",
  sent_1: "#0F3154",
  sent_2: "#0F3154",
  replied: "#15803d",
  claimed: "#15803d",
  not_interested: "#b91c1c",
};

// The sequence as it is actually sent. Kept here so the copy has one home
// rather than living only in a sent-mail folder.
const SEQUENCE = [
  {
    n: 1,
    name: "SNM Cold 1 — Free club listing",
    subject: "Listing {{club}} on Soccer Near Me",
    purpose:
      "The opener. Leads with the 100,000-member Facebook group as the reason the directory exists, offers the listing free, links the finished KC Legends example, offers to build it from their age groups and playing level, and promises approval before it is shared with the group. Signed Neil.",
    timing: "Day 0",
  },
  {
    n: 2,
    name: "SNM Cold 2 — Blog write-up",
    subject: "Re: Listing {{club}} on Soccer Near Me",
    purpose:
      "Same thread, non-repliers only. Adds the blog write-up as a second reason to claim the listing, linking the KC Legends article.",
    timing: "4–5 days after email 1",
  },
];

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
  const [saving, setSaving] = useState<number | null>(null);
  const [onlyWithEmail, setOnlyWithEmail] = useState(true);

  useEffect(() => {
    fetch("/api/focus/cold")
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.clubs) setClubs(d.clubs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setStatus = async (clubId: number, status: string) => {
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
                  <p style={{ margin: "6px 0 0", fontSize: 13 }}>
                    {c.email
                      ? <a href={`mailto:${c.email}`} style={{ color: "#0F3154", fontWeight: 600 }}>{c.email}</a>
                      : <span style={{ color: "#b91c1c", fontWeight: 600 }}>No email on file</span>}
                  </p>
                  {c.phone && <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6B7D8E" }}>{c.phone}</p>}
                  {c.website && (
                    <p style={{ margin: "2px 0 0", fontSize: 13 }}>
                      <a href={c.website} target="_blank" rel="noreferrer" style={{ color: "#6B7D8E" }}>{c.website}</a>
                    </p>
                  )}
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
                    {c.email1_sent_at ? `E1 ${String(c.email1_sent_at).slice(0, 10)}` : "E1 —"}
                    {"  ·  "}
                    {c.email2_sent_at ? `E2 ${String(c.email2_sent_at).slice(0, 10)}` : "E2 —"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "sequence" && (
        <>
          <p style={{ color: "#6B7D8E", fontSize: 14, marginTop: 0 }}>
            Sent by hand from Gmail. Mark each club&rsquo;s status on the Clubs tab as you go.
          </p>
          {SEQUENCE.map(e => (
            <div key={e.n} style={card}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>
                Email {e.n} · {e.timing}
              </p>
              <p style={{ margin: "6px 0 0", fontWeight: 700, color: "#0F3154" }}>{e.name}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#0F3154" }}>
                <strong>Subject:</strong> {e.subject}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "#6B7D8E", lineHeight: 1.6 }}>{e.purpose}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
