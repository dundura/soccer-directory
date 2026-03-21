"use client";

import { useState, useCallback, useEffect } from "react";

interface UploadedFile {
  name: string;
  label: string;
  cdnUrl: string;
  size: string;
  timestamp: number;
  hidden: boolean;
}

const STORAGE_KEY = "snm_admin_uploads";

function loadFiles(): UploadedFile[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveFiles(files: UploadedFile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch { /* storage full */ }
}

export function AdminUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [folder, setFolder] = useState("soccer-directory/uploads");
  const [copied, setCopied] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [editingLabel, setEditingLabel] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    setFiles(loadFiles());
  }, []);

  // Save to localStorage whenever files change
  const updateFiles = useCallback((updater: (prev: UploadedFile[]) => UploadedFile[]) => {
    setFiles((prev) => {
      const next = updater(prev);
      saveFiles(next);
      return next;
    });
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadFile = useCallback(async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          folder,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const putRes = await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      if (!putRes.ok) throw new Error("Failed to upload file to S3");

      updateFiles((prev) => [
        {
          name: file.name,
          label: "",
          cdnUrl: data.cdnUrl,
          size: formatSize(file.size),
          timestamp: Date.now(),
          hidden: false,
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      setError((err as Error).message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [folder, updateFiles]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach(uploadFile);
    },
    [uploadFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    selected.forEach(uploadFile);
    e.target.value = "";
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRenameLabel = (timestamp: number, label: string) => {
    updateFiles((prev) => prev.map((f) => f.timestamp === timestamp ? { ...f, label } : f));
    setEditingLabel(null);
  };

  const handleToggleHidden = (timestamp: number) => {
    updateFiles((prev) => prev.map((f) => f.timestamp === timestamp ? { ...f, hidden: !f.hidden } : f));
  };

  const handleDelete = (timestamp: number) => {
    updateFiles((prev) => prev.filter((f) => f.timestamp !== timestamp));
  };

  const visibleFiles = files.filter((f) => !f.hidden);
  const hiddenFiles = files.filter((f) => f.hidden);

  return (
    <div>
      <p className="text-muted text-sm mb-6">
        Upload any file (PDFs, images, videos, etc.) to CloudFront CDN and get a shareable URL.
      </p>

      {/* Folder input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary mb-1">
          S3 Folder Path
        </label>
        <input
          type="text"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="w-full max-w-md border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          placeholder="soccer-directory/uploads"
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border bg-surface hover:border-muted"
        }`}
      >
        {uploading ? (
          <div>
            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-muted">Uploading...</p>
          </div>
        ) : (
          <>
            <svg className="w-12 h-12 text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-muted mb-2">
              Drag & drop files here, or{" "}
              <label className="text-accent-hover hover:text-accent cursor-pointer font-semibold">
                browse
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-muted">Any file type — PDFs, images, videos, documents</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-[#DC373E] rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Uploaded files list */}
      {visibleFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-4">
            Uploaded Files ({visibleFiles.length})
          </h3>
          <div className="space-y-3">
            {visibleFiles.map((f) => (
              <div
                key={f.timestamp}
                className="bg-white border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Editable label */}
                    {editingLabel === f.timestamp ? (
                      <input
                        autoFocus
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleRenameLabel(f.timestamp, editingValue)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameLabel(f.timestamp, editingValue);
                          if (e.key === "Escape") setEditingLabel(null);
                        }}
                        className="w-full text-sm font-semibold px-2 py-1 border border-accent rounded-lg focus:outline-none"
                        placeholder="Give this file a name..."
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <p
                          className="font-semibold text-primary text-sm cursor-pointer hover:text-accent transition-colors"
                          onClick={() => { setEditingLabel(f.timestamp); setEditingValue(f.label || ""); }}
                          title="Click to name this file"
                        >
                          {f.label || <span className="text-muted italic">Click to add a name...</span>}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted mt-0.5">{f.name} &middot; {f.size} &middot; {new Date(f.timestamp).toLocaleDateString()}</p>
                    <p className="text-xs text-accent-hover truncate mt-1 font-mono">
                      {f.cdnUrl}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => copyUrl(f.cdnUrl)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        copied === f.cdnUrl
                          ? "bg-green-100 text-green-700"
                          : "bg-surface text-muted hover:bg-gray-200"
                      }`}
                    >
                      {copied === f.cdnUrl ? "Copied!" : "Copy URL"}
                    </button>
                    <a
                      href={f.cdnUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-accent/10 text-accent-hover rounded-lg text-xs font-semibold hover:bg-accent/20 transition-colors"
                    >
                      Open
                    </a>
                    <button
                      onClick={() => handleToggleHidden(f.timestamp)}
                      className="px-3 py-1.5 bg-surface text-muted rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                      title="Hide from view"
                    >
                      Hide
                    </button>
                    <button
                      onClick={() => handleDelete(f.timestamp)}
                      className="px-3 py-1.5 bg-red-50 text-[#DC373E] rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                      title="Remove from list (file stays on CDN)"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden files */}
      {hiddenFiles.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowHidden(!showHidden)}
            className="text-sm text-muted hover:text-primary font-semibold transition-colors"
          >
            {showHidden ? "Hide" : "Show"} {hiddenFiles.length} hidden file{hiddenFiles.length !== 1 ? "s" : ""}
          </button>
          {showHidden && (
            <div className="space-y-2 mt-3">
              {hiddenFiles.map((f) => (
                <div
                  key={f.timestamp}
                  className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between gap-4 opacity-60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-primary truncate">{f.label || f.name}</p>
                    <p className="text-xs text-muted truncate font-mono">{f.cdnUrl}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => copyUrl(f.cdnUrl)}
                      className="px-3 py-1.5 bg-surface text-muted rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleToggleHidden(f.timestamp)}
                      className="px-3 py-1.5 bg-accent/10 text-accent-hover rounded-lg text-xs font-semibold hover:bg-accent/20 transition-colors"
                    >
                      Show
                    </button>
                    <button
                      onClick={() => handleDelete(f.timestamp)}
                      className="px-3 py-1.5 bg-red-50 text-[#DC373E] rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
