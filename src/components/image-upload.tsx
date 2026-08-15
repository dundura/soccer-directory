"use client";

import { useState, useRef } from "react";

// Chat apps (WhatsApp, iMessage) won't show link-preview images over ~300-600KB,
// so compress in the browser before upload: downscale to max 1600px and re-encode
// as JPEG. GIFs (animation) and already-small files pass through untouched.
const MAX_DIMENSION = 1600;
const TARGET_BYTES = 450 * 1024;

// What /api/upload will accept. A file of any other type has to be re-encoded
// here or the upload is rejected — which is what happened to every photo picked
// straight from an iPhone library: iOS hands over image/heic, the old
// "already small enough" shortcut passed it through untouched, and the API
// answered "File type not allowed."
const UPLOADABLE = ["image/jpeg", "image/png", "image/webp", "image/gif"];

async function compressImage(file: File): Promise<File> {
  const typeOk = UPLOADABLE.includes(file.type);
  // GIFs are animated; re-encoding would flatten them to one frame.
  if (file.type === "image/gif") return file;
  // Only skip the work when the file is BOTH small enough and already a type
  // the API takes. Skipping on size alone is what let HEIC through.
  if (typeOk && file.size <= TARGET_BYTES) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // white background so transparent PNGs don't turn black as JPEG
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    // Bigger than the original is only a reason to keep the original when the
    // original can actually be uploaded. For a HEIC, a larger JPEG still beats
    // a file the API will refuse.
    if (!blob) return file;
    if (blob.size >= file.size && typeOk) return file;
    return new File([blob.slice(0, blob.size, "image/jpeg")], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // any failure: upload the original and let the API judge it
  }
}

export function ImageUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(rawFile: File) {
    setError("");
    if (!rawFile.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (rawFile.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const file = await compressImage(rawFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const json = await res.json();
      if (!res.ok) {
        // 401 here means the session lapsed while the form was open, which the
        // generic message made look like a broken uploader.
        if (res.status === 401) throw new Error("Your session expired — sign in again and retry.");
        if (!UPLOADABLE.includes(file.type)) {
          throw new Error("That photo format could not be converted. Save it as a JPEG or PNG and try again.");
        }
        throw new Error(json.error || "Failed to get upload URL");
      }

      const putRes = await fetch(json.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload failed");

      onUploaded(json.cdnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
        />
        {uploading ? (
          <p className="text-sm text-muted animate-pulse">Uploading...</p>
        ) : (
          <p className="text-sm text-muted">
            <span className="font-semibold text-accent">Click to upload</span> or drag and drop
            <br />
            <span className="text-xs">JPEG, PNG, WebP, GIF &middot; Max 10 MB</span>
          </p>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
