"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function InlineEditField({
  ownerId,
  listingType,
  listingId,
  field,
  value,
  className,
  multiline,
  tag: Tag = "p",
}: {
  ownerId: string | null;
  listingType: string;
  listingId: string;
  field: string;
  value: string;
  className?: string;
  multiline?: boolean;
  tag?: "p" | "h1" | "h2" | "h3" | "span" | "div";
}) {
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [current, setCurrent] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isOwner = session?.user?.id === ownerId;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const canEdit = isOwner || isAdmin;

  async function save() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/listings/inline", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: listingType, id: listingId, field, value: draft }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to save");
      }
      setCurrent(draft);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="space-y-2">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            autoFocus
          />
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving || draft === current}
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => { setDraft(current); setEditing(false); setError(""); }}
            className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>
    );
  }

  const hasHtml = /<[a-z][\s\S]*>/i.test(current);

  return (
    <div className="group/inline relative">
      {current ? (
        hasHtml ? (
          <Tag className={className} dangerouslySetInnerHTML={{ __html: current }} />
        ) : (
          <Tag className={className}>{current}</Tag>
        )
      ) : (
        <Tag className={className}><span className="text-muted italic">Not set</span></Tag>
      )}
      {canEdit && (
        <button
          onClick={() => { setDraft(current); setEditing(true); }}
          className="inline-flex ml-2 text-xs font-semibold text-accent hover:text-accent-hover transition-colors opacity-0 group-hover/inline:opacity-100"
        >
          Edit
        </button>
      )}
    </div>
  );
}
