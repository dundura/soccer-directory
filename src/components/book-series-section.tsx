"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { BookSeries } from "@/lib/db";

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:border-accent";

async function postBookSeries(payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/book-series", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, error: data.error };
}

function AddExistingBookForm({ bookId, otherBooks, onAdded, onCancel }: {
  bookId: string;
  otherBooks: { id: string; name: string }[];
  onAdded: () => void;
  onCancel: () => void;
}) {
  const [existingBookId, setExistingBookId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const attachExisting = async () => {
    setSaving(true);
    setError("");
    const result = await postBookSeries({ action: "attachBook", bookId, targetBookId: existingBookId });
    setSaving(false);
    if (result.ok) onAdded();
    else setError(result.error || "The book could not be added.");
  };

  return (
    <div className="bg-white rounded-xl p-4 space-y-3 border border-border">
      <label htmlFor="existing-book" className="block text-sm font-bold text-primary">Add a book you already listed</label>
      <select id="existing-book" value={existingBookId} onChange={(e) => setExistingBookId(e.target.value)} className={`${inputClass} min-w-0`}>
        <option value="">Choose a book</option>
        {otherBooks.map((book) => <option key={book.id} value={book.id}>{book.name}</option>)}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={attachExisting} disabled={saving || !existingBookId} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50">
          {saving ? "Saving..." : "Add This Book"}
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
  const [otherBooks, setOtherBooks] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExistingForm, setShowExistingForm] = useState(false);

  const fetchSeries = useCallback(async () => {
    const res = await fetch(`/api/book-series?bookId=${encodeURIComponent(bookId)}`);
    const data = await res.json().catch(() => ({}));
    setAllSeries(data.series || []);
    setOtherBooks(data.otherBooks || []);
    setLoading(false);
  }, [bookId]);

  useEffect(() => { fetchSeries(); }, [fetchSeries]);

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

  if (loading) return null;
  // Readers only see this once there is more than one book to show.
  if (!isOwner && (!series || series.books.length < 2)) return null;

  return (
    <section className="border-t border-border pt-6 mt-6 mb-6" aria-labelledby="book-series-heading">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 id="book-series-heading" className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold text-primary uppercase tracking-tight">Books</h2>
        {isOwner && (
          <div className="flex flex-wrap justify-end gap-3 flex-shrink-0">
            {otherBooks.length > 0 && (
              <button onClick={() => setShowExistingForm(!showExistingForm)} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">+ Existing Book</button>
            )}
            {/* Opens the full book listing form; the new page joins this series when saved. */}
            <a href={`/dashboard?type=soccerbook&seriesBook=${encodeURIComponent(bookId)}`} className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors">+ New Book</a>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isOwner && showExistingForm && otherBooks.length > 0 && (
          <AddExistingBookForm
            bookId={bookId}
            otherBooks={otherBooks}
            onCancel={() => setShowExistingForm(false)}
            onAdded={() => { setShowExistingForm(false); fetchSeries(); }}
          />
        )}

        {!series && !showExistingForm && (
          <p className="text-sm text-muted text-center py-4">Have more books in this series? Add them here.</p>
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
