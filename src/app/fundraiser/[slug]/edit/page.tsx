"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

type RosterEntry = { id: string; playerName: string; email?: string; inviteStatus?: string; position?: string; ageGroup?: string; amountRaised?: number; userId?: string };

export default function ManageRosterPage() {
  const { status } = useSession();
  const { slug } = useParams<{ slug: string }>();

  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  useEffect(() => {
    fetch(`/api/fundraiser/${slug}/invite`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setRoster(data);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [slug]);

  if (status === "loading" || !loaded) return <div className="max-w-xl mx-auto px-6 py-20 text-center text-muted">Loading...</div>;
  if (status === "unauthenticated") {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-2">Sign In Required</h1>
        <a href="/api/auth/signin" className="inline-block px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-colors">Sign In</a>
      </div>
    );
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true); setInviteMsg("");
    try {
      const res = await fetch(`/api/fundraiser/${slug}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to invite");
      setInviteMsg(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      const rosterRes = await fetch(`/api/fundraiser/${slug}/invite`);
      const rosterData = await rosterRes.json();
      if (Array.isArray(rosterData)) setRoster(rosterData);
    } catch (err) {
      setInviteMsg(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary">Manage Roster</h1>
        <a href={`/fundraiser/${slug}`} className="text-sm text-accent hover:text-accent-hover">View Page &rarr;</a>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-lg">
        <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-extrabold text-primary uppercase tracking-tight mb-1">Invite Players</h2>
        <p className="text-sm text-muted mb-4">Add players by email. They'll receive an invite to create an account and join the roster. Donors can then credit donations to specific players.</p>

        <form onSubmit={handleInvite} className="flex gap-2 mb-4">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="player@example.com"
            className={inputClass}
            required
          />
          <button
            type="submit"
            disabled={inviting}
            className="shrink-0 px-5 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {inviting ? "Sending..." : "Send Invite"}
          </button>
        </form>

        {inviteMsg && (
          <p className={`text-sm mb-4 px-4 py-2 rounded-lg ${inviteMsg.startsWith("Invite sent") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {inviteMsg}
          </p>
        )}

        {roster.length > 0 && (
          <div className="space-y-2">
            {roster.map((p) => (
              <div key={p.id} className={`flex items-center gap-3 py-3 px-3 rounded-xl border bg-surface/50 ${p.inviteStatus === "requested" ? "border-yellow-300 bg-yellow-50/50" : "border-border"}`}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-primary">
                    {p.inviteStatus === "pending" ? (p.email || "Unknown") : p.playerName}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {p.email && <span>{p.email}</span>}
                    {p.position && <span> &middot; {p.position}</span>}
                    {p.ageGroup && <span> &middot; {p.ageGroup}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  {(p.amountRaised || 0) > 0 && (
                    <div className="text-xs font-bold text-green-700">
                      ${((p.amountRaised || 0) / 100).toLocaleString("en-US")} raised
                    </div>
                  )}
                  {p.inviteStatus === "requested" ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/fundraiser/${slug}/invite`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "approve", entryId: p.id, userId: p.userId }),
                          });
                          if (res.ok) {
                            setRoster(roster.map(r => r.id === p.id ? { ...r, inviteStatus: "accepted" } : r));
                          }
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Reject ${p.playerName}?`)) return;
                          const res = await fetch(`/api/fundraiser/${slug}/invite`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "reject", entryId: p.id }),
                          });
                          if (res.ok) {
                            setRoster(roster.filter(r => r.id !== p.id));
                          }
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-[#DC373E] font-bold hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        p.inviteStatus === "accepted"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      }`}>
                        {p.inviteStatus === "accepted" ? "Joined" : "Pending Invite"}
                      </span>
                      <button
                        onClick={async () => {
                          if (!confirm(`Remove ${p.inviteStatus === "pending" ? (p.email || "this player") : p.playerName} from the roster?`)) return;
                          const res = await fetch(`/api/fundraiser/${slug}/roster-edit`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ entryId: p.id }),
                          });
                          if (res.ok) setRoster(roster.filter(r => r.id !== p.id));
                        }}
                        className="text-xs px-2 py-1 rounded-lg border border-red-200 text-[#DC373E] hover:bg-red-50 transition-colors"
                        title="Remove from roster"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {roster.length === 0 && (
          <p className="text-sm text-muted text-center py-4">No players invited yet. Send an invite above to get started.</p>
        )}
      </div>
    </div>
  );
}
