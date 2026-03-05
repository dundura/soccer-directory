"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ImageUpload } from "@/components/image-upload";

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

type RosterPlayer = {
  id: string; playerName: string; position?: string; ageGroup?: string;
  photoUrl?: string; bio?: string; userId?: string; amountRaised?: number;
};

export function RosterList({ roster: initialRoster, slug }: { roster: RosterPlayer[]; slug: string }) {
  const { data: session } = useSession();
  const [roster, setRoster] = useState(initialRoster);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editAgeGroup, setEditAgeGroup] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(p: RosterPlayer) {
    setEditingId(p.id);
    setEditName(p.playerName);
    setEditPosition(p.position || "");
    setEditAgeGroup(p.ageGroup || "");
    setEditPhotoUrl(p.photoUrl || "");
    setEditBio(p.bio || "");
    setError("");
  }

  async function handleSave() {
    if (!editName.trim()) { setError("Name is required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/fundraiser/${slug}/roster-edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId: editingId,
          playerName: editName.trim(),
          position: editPosition.trim(),
          ageGroup: editAgeGroup.trim(),
          photoUrl: editPhotoUrl.trim(),
          bio: editBio.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setRoster(roster.map(r => r.id === editingId ? {
        ...r, playerName: editName.trim(), position: editPosition.trim() || undefined,
        ageGroup: editAgeGroup.trim() || undefined, photoUrl: editPhotoUrl.trim() || undefined,
        bio: editBio.trim() || undefined,
      } : r));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {roster.map((player) => {
        const isMe = session?.user?.id && player.userId === session.user.id;
        const initials = player.playerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

        if (editingId === player.id) {
          return (
            <div key={player.id} className="py-3 border-b border-border last:border-b-0">
              <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
                <h4 className="text-sm font-bold text-primary">Edit Your Profile</h4>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Name *</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">Position</label>
                    <input type="text" value={editPosition} onChange={(e) => setEditPosition(e.target.value)} className={inputClass} placeholder="e.g. Forward" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">Age Group</label>
                    <input type="text" value={editAgeGroup} onChange={(e) => setEditAgeGroup(e.target.value)} className={inputClass} placeholder="e.g. U14" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Photo</label>
                  {editPhotoUrl && <img src={editPhotoUrl} alt="Preview" className="w-14 h-14 rounded-full object-cover mb-2" />}
                  <ImageUpload onUploaded={(url) => setEditPhotoUrl(url)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Short Bio</label>
                  <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={2} className={inputClass} />
                </div>
                {error && <p className="text-red-600 text-xs">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50">
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted hover:bg-surface transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={player.id} className="flex items-center gap-3.5 py-3 border-b border-border last:border-b-0">
            {player.photoUrl ? (
              <img src={player.photoUrl} alt={player.playerName} className="w-[42px] h-[42px] rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#DC373E] to-[#a02028] flex items-center justify-center text-white font-[family-name:var(--font-display)] text-lg font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-primary">{player.playerName}</div>
              {(player.position || player.ageGroup) && (
                <div className="text-[13px] text-muted mt-0.5">
                  {[player.position, player.ageGroup].filter(Boolean).join(" \u2022 ")}
                </div>
              )}
              {player.bio && <p className="text-sm text-muted/80 mt-1">{player.bio}</p>}
              {isMe && (
                <button onClick={() => startEdit(player)} className="text-xs text-accent hover:text-accent-hover font-medium mt-1">
                  Edit Profile
                </button>
              )}
            </div>
            <div className="text-right shrink-0">
              {(player.amountRaised || 0) > 0 && (
                <div className="text-sm font-bold text-green-700 mb-0.5">
                  ${((player.amountRaised || 0) / 100).toLocaleString("en-US")}
                </div>
              )}
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                Player
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
