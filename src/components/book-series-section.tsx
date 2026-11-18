"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { BookSeries } from "@/lib/db";
import { ImageUpload } from "@/components/image-upload";

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent";

export async function postBookSeries(payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string; slug?: string }> {
  const res = await fetch("/api/book-series", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, error: data.error, slug: data.slug };
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="max-h-[100px] rounded-lg object-cover" />
          <button type="button" onClick={() => onChange("")} aria-label="Remove image" className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80">&#x2715;</button>
        </div>
      ) : (
        <ImageUpload onUploaded={onChange} />
      )}
    </div>
  );
}

export function SeriesForm({ heading, submitLabel, initial, onSubmit, onCancel }: {
  heading: string;
  submitLabel: string;
  initial?: { title: string; description?: string; previewImage?: string };
  onSubmit: (values: { title: string; description: string; previewImage: string }) => Promise<string | undefined>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [previewImage, setPreviewImage] = useState(initial?.previewImage || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true);
    setError("");
    const problem = await onSubmit({ title: title.trim(), description, previewImage });
    setSaving(false);
    if (problem) setError(problem);
  };

  return (
    <div className="bg-white rounded-xl p-4 space-y-3 border border-border">
      <p className="text-sm font-bold text-primary">{heading}</p>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Series name (e.g. England or Bust)" className={inputClass} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Subtext shown under the series name (optional)" rows={2} className={`${inputClass} resize-none`} />
      <ImageField label="Preview Image (optional, uses the first book's cover if blank)" value={previewImage} onChange={setPreviewImage} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={submit} disabled={saving || !title.trim()} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
          {saving ? "Saving..." : submitLabel}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
      </div>
    </div>
  );
}

export function AddBookForm({ bookId, series, defaultSeriesId, onAdded, onCancel }: {
  bookId: string;
  series: { id: string; title: string }[];
  defaultSeriesId?: string;
  onAdded: () => void;
  onCancel: () => void;
}) {
  const [seriesId, setSeriesId] = useState(defaultSeriesId || series[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true);
    setError("");
    const result = await postBookSeries({ action: "addBook", bookId, seriesId, title: title.trim(), description, imageUrl, website, price });
    setSaving(false);
    if (result.ok) onAdded();
    else setError(result.error || "The book could not be added.");
  };

  return (
    <div className="bg-white rounded-xl p-4 space-y-3 border border-border">
      <p className="text-sm font-bold text-primary">Add Book</p>
      {series.length > 1 && (
        <select value={seriesId} onChange={(e) => setSeriesId(e.target.value)} aria-label="Series" className={inputClass}>
          {series.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      )}
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" className={inputClass} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} className={`${inputClass} resize-none`} />
      <ImageField label="Book Cover (optional)" value={imageUrl} onChange={setImageUrl} />
      <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website / purchase link (optional)" className={inputClass} />
      <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (optional, e.g. $14.99)" className={inputClass} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={submit} disabled={saving || !title.trim() || !seriesId} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
          {saving ? "Saving..." : "Add Book"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface transition-colors">Cancel</button>
      </div>
    </div>
  );
}

export function BookSeriesSection({ bookId, ownerId }: { bookId: string; ownerId: string | null }) {
  const { data: session } = useSession();
  const isOwner = !!(ownerId && session?.user?.id === ownerId) || (session?.user as { role?: string } | undefined)?.role === "admin";

  const [allSeries, setAllSeries] = useState<BookSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editing, setEditing] = useState(false);

  const fetchSeries = useCallback(async () => {
    const res = await fetch(`/api/book-series?bookId=${encodeURIComponent(bookId)}`);
    const data = await res.json().catch(() => ({}));
    setAllSeries(data.series || []);
    setLoading(false);
  }, [bookId]);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);

  // This page shows the series the book belongs to, listing its books directly.
  const series = allSeries.find((item) => item.books.some((book) => book.id === bookId));

  const move = async (index: number, direction: -1 | 1) => {
    if (!series) return;
    const target = index + direction;
    if (target < 0 || target >= series.books.length) return;
    const order = series.books.map((book) => book.id);
    [order[index], order[target]] = [order[target], order[index]];
    await postBookSeries({ action: "reorderBooks", bookId, seriesId: series.id, order });
    fetchSeries();
  };

  const removeBook = async (targetBookId: string) => {
    if (!series) return;
    if (!confirm("Remove this book from the series? The book stays listed with its own page.")) return;
    await postBookSeries({ action: "removeBook", bookId, seriesId: series.id, targetBookId });
    fetchSeries();
  };

  const deleteSeries = async () => {
    if (!series) return;
    if (!confirm("Delete this series? The books stay listed with their own pages.")) return;
    await postBookSeries({ action: "deleteSeries", bookId, seriesId: series.id });
    fetchSeries();
  };

  if (loading) return null;
  if (!series && !isOwner) return null;

  return (
    <section className="border-t border-border pt-6 mt-6 mb-6" aria-labelledby="book-series-heading">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 id="book-series-heading" className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold text-primary uppercase tracking-tight">Books</h2>
          {series && <p className="text-sm font-semibold text-accent mt-1 break-words">{series.title}</p>}
          {series?.description && <p className="text-sm text-primary/70 mt-1 whitespace-pre-line">{series.description}</p>}
        </div>
        {isOwner && (
          <div className="flex flex-wrap justify-end gap-3 flex-shrink-0">
            {series ? (
              <>
                <button onClick={() => { setEditing(!editing); setShowBookForm(false); }} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">Edit Series</button>
                <button onClick={() => { setShowBookForm(!showBookForm); setEditing(false); }} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">+ Add Book</button>
                <button onClick={deleteSeries} className="text-xs font-semibold text-muted hover:text-red-500 transition-colors">Delete Series</button>
              </>
            ) : (
              <button onClick={() => setShowSeriesForm(!showSeriesForm)} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">+ New Series</button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isOwner && !series && showSeriesForm && (
          <SeriesForm
            heading="New Series"
            submitLabel="Create Series"
            onCancel={() => setShowSeriesForm(false)}
            onSubmit={async (values) => {
              const result = await postBookSeries({ action: "createSeries", bookId, ...values });
              if (!result.ok) return result.error || "The series could not be created.";
              setShowSeriesForm(false);
              fetchSeries();
            }}
          />
        )}

        {isOwner && series && editing && (
          <SeriesForm
            heading="Edit Series"
            submitLabel="Save Series"
            initial={series}
            onCancel={() => setEditing(false)}
            onSubmit={async (values) => {
              const result = await postBookSeries({ action: "updateSeries", bookId, seriesId: series.id, ...values });
              if (!result.ok) return result.error || "The series could not be saved.";
              setEditing(false);
              fetchSeries();
            }}
          />
        )}

        {isOwner && series && showBookForm && (
          <AddBookForm
            bookId={bookId}
            series={[series]}
            defaultSeriesId={series.id}
            onCancel={() => setShowBookForm(false)}
            onAdded={() => { setShowBookForm(false); fetchSeries(); }}
          />
        )}

        {!series && isOwner && !showSeriesForm && (
          <p className="text-sm text-muted text-center py-4">This book is not in a series yet. Create a series to add more books.</p>
        )}

        {series?.books.map((book, index) => {
          const isCurrent = book.id === bookId;
          const description = (book.description || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
          return (
            <a
              key={book.id}
              href={`/books-and-authors/${book.slug}`}
              aria-current={isCurrent ? "page" : undefined}
              className="group flex bg-white rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="w-1.5 bg-accent self-stretch flex-shrink-0 rounded-l-xl" />
              {book.imageUrl && (
                <div className="flex items-center justify-center flex-shrink-0 p-2 sm:p-4">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-surface">
                    <img src={book.imageUrl} alt="" loading="lazy" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0 p-3 sm:p-5 flex items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted">Book {index + 1}</p>
                  <h3 className="font-[family-name:var(--font-display)] text-base sm:text-xl leading-tight font-extrabold text-primary uppercase tracking-tight break-words group-hover:text-accent transition-colors">{book.name}</h3>
                  {description && <p className="text-sm text-primary/70 mt-1 line-clamp-2">{description}</p>}
                  <span className="text-sm font-semibold text-accent whitespace-nowrap group-hover:text-accent-hover transition-colors mt-2 inline-block">{isCurrent ? "Viewing now" : "View Book →"}</span>
                </div>
                {isOwner && (
                  <div className="flex flex-col gap-1 flex-shrink-0 items-center">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); move(index, -1); }} className="text-muted hover:text-primary transition-colors p-0.5" title="Move up" aria-label={`Move ${book.name} up`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); move(index, 1); }} className="text-muted hover:text-primary transition-colors p-0.5" title="Move down" aria-label={`Move ${book.name} down`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeBook(book.id); }} className="text-[10px] text-muted hover:text-red-500 transition-colors" aria-label={`Remove ${book.name} from the series`}>✕</button>
                  </div>
                )}
              </div>
              <div className="hidden sm:flex items-center justify-center w-14 flex-shrink-0 bg-primary group-hover:bg-accent transition-colors self-stretch rounded-r-xl">
                <span className="text-white text-2xl font-light">&#8250;</span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
