"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

type Props = {
  slug: string;
  ownerId: string;
  field: string;
  value: string;
  as?: "h1" | "p" | "span" | "div";
  className?: string;
  multiline?: boolean;
  placeholder?: string;
};

export function InlineEdit({ slug, ownerId, field, value: initialValue, as: Tag = "p", className = "", multiline = false, placeholder }: Props) {
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const isOwner = session?.user?.id === ownerId;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Place cursor at end
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  const hasHtml = /<[a-z][\s\S]*>/i.test(value);

  if (!isOwner) {
    if (!value) return null;
    return hasHtml ? <Tag className={className} dangerouslySetInnerHTML={{ __html: value }} /> : <Tag className={className}>{value}</Tag>;
  }

  async function save(newValue: string) {
    if (newValue === initialValue) { setEditing(false); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/fundraiser/${slug}/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value: newValue }),
      });
      if (res.ok) {
        setValue(newValue);
      } else {
        setValue(initialValue);
      }
    } catch {
      setValue(initialValue);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  if (editing) {
    const inputClass = "w-full px-3 py-2 rounded-lg border-2 border-accent/50 text-sm focus:outline-none focus:border-accent bg-white " + className;

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => save(value)}
          onKeyDown={(e) => { if (e.key === "Escape") { setValue(initialValue); setEditing(false); } }}
          className={inputClass + " resize-none"}
          rows={5}
          disabled={saving}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => save(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save(value);
          if (e.key === "Escape") { setValue(initialValue); setEditing(false); }
        }}
        className={inputClass}
        disabled={saving}
      />
    );
  }

  return (
    <Tag
      className={`${className} cursor-pointer hover:bg-accent/5 rounded-lg transition-colors relative group`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value ? (hasHtml ? <span dangerouslySetInnerHTML={{ __html: value }} /> : value) : <span className="text-muted/50 italic">{placeholder || "Click to add..."}</span>}
      <svg className="inline-block w-3.5 h-3.5 ml-1.5 text-accent/40 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </Tag>
  );
}
