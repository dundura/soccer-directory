"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { BookSeries } from "@/lib/db";
import { AddBookForm, SeriesForm, postBookSeries } from "@/components/book-series-section";

const plainText = (html?: string) => (html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const externalUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

export function SeriesDetail({ bookId, ownerId, series }: { bookId: string; ownerId: string | null; series: BookSeries }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isOwner = !!(ownerId && session?.user?.id === ownerId) || (session?.user as { role?: string } | undefined)?.role === "admin";

  const [view, setView] = useState<"full" | "list">("full");
  const [showBookForm, setShowBookForm] = useState(false);
  const [editing, setEditing] = useState(false);

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= series.books.length) return;
    const order = series.books.map((book) => book.id);
    [order[index], order[target]] = [order[target], order[index]];
    await postBookSeries({ action: "reorderBooks", bookId, seriesId: series.id, order });
    router.refresh();
  };

  const removeBook = async (targetBookId: string) => {
    if (!confirm("Remove this book from the series? The book stays listed with its own page.")) return;
    await postBookSeries({ action: "removeBook", bookId, seriesId: series.id, targetBookId });
    router.refresh();
  };

  const tabClass = (active: boolean) =>
    `px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${active ? "bg-white shadow-sm text-primary" : "text-muted hover:text-primary"}`;

  return (
    <div className="space-y-4">
      {/* Tabs + owner actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1 bg-surface rounded-lg p-1 border border-border">
          <button onClick={() => setView("full")} aria-pressed={view === "full"} className={tabClass(view === "full")}>Full</button>
          <button onClick={() => setView("list")} aria-pressed={view === "list"} className={tabClass(view === "list")}>List</button>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(!editing); setShowBookForm(false); }} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-primary hover:bg-surface transition-colors">
              Edit Series
            </button>
            <button onClick={() => { setShowBookForm(!showBookForm); setEditing(false); }} className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors">
              + Add Book
            </button>
          </div>
        )}
      </div>

      {isOwner && editing && (
        <SeriesForm
          heading="Edit Series"
          submitLabel="Save Series"
          initial={series}
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            const result = await postBookSeries({ action: "updateSeries", bookId, seriesId: series.id, ...values });
            if (!result.ok) return result.error || "The series could not be saved.";
            setEditing(false);
            router.refresh();
          }}
        />
      )}

      {isOwner && showBookForm && (
        <AddBookForm
          bookId={bookId}
          series={[series]}
          defaultSeriesId={series.id}
          onCancel={() => setShowBookForm(false)}
          onAdded={() => { setShowBookForm(false); router.refresh(); }}
        />
      )}

      {series.books.length === 0 && (
        <p className="text-muted text-center py-8">No books in this series yet.</p>
      )}

      {/* List view */}
      {view === "list" && series.books.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {series.books.map((book, index) => (
            <div key={book.id} className="flex items-start gap-3 px-4 sm:px-5 py-3 border-b border-border last:border-b-0 hover:bg-surface transition-colors">
              <span className="text-xs text-muted w-5 flex-shrink-0">{index + 1}</span>
              <a href={`/books-and-authors/${book.slug}`} className="flex-1 text-sm font-semibold text-primary hover:text-accent transition-colors min-w-0 break-words">
                {book.name}
              </a>
              {isOwner && (
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${book.name} up`} className="w-6 h-6 flex items-center justify-center rounded text-muted hover:text-primary disabled:opacity-30 transition-colors text-xs">▲</button>
                  <button onClick={() => move(index, 1)} disabled={index === series.books.length - 1} aria-label={`Move ${book.name} down`} className="w-6 h-6 flex items-center justify-center rounded text-muted hover:text-primary disabled:opacity-30 transition-colors text-xs">▼</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Full view */}
      {view === "full" && series.books.map((book, index) => {
        const description = plainText(book.description);
        return (
          <div key={book.id} className="bg-white rounded-xl border border-border p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0 w-full">
                <p className="text-xs font-semibold text-muted mb-1">Book {index + 1}</p>
                <a href={`/books-and-authors/${book.slug}`} className="hover:text-accent transition-colors">
                  <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-extrabold text-primary uppercase tracking-tight hover:text-accent break-words">{book.name}</h2>
                </a>
                {(book.imageUrl || description) && (
                  <div className="mt-2 overflow-hidden">
                    {book.imageUrl && (
                      <a href={`/books-and-authors/${book.slug}`} className="block mb-3 sm:float-left sm:mr-5">
                        <img src={book.imageUrl} alt={`Cover of ${book.name}`} loading="lazy" className="w-full max-h-[260px] object-contain sm:w-32 sm:max-h-none rounded-lg" />
                      </a>
                    )}
                    {description && <p className="text-sm text-primary/70 leading-relaxed line-clamp-6">{description}</p>}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <a href={`/books-and-authors/${book.slug}`} className="text-xs font-semibold text-accent hover:underline">View Book →</a>
                </div>
                {book.website && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a href={externalUrl(book.website)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors">
                      Get the Book ↗
                    </a>
                  </div>
                )}
              </div>
              {isOwner && (
                <div className="flex gap-4 flex-shrink-0 items-center order-first sm:order-last self-end sm:self-auto">
                  <button onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${book.name} up`} className="text-xs text-muted hover:text-primary disabled:opacity-30 transition-colors">▲</button>
                  <button onClick={() => move(index, 1)} disabled={index === series.books.length - 1} aria-label={`Move ${book.name} down`} className="text-xs text-muted hover:text-primary disabled:opacity-30 transition-colors">▼</button>
                  <a href={`/dashboard?editType=soccerbook&editId=${encodeURIComponent(book.id)}`} className="text-xs text-accent hover:text-accent-hover transition-colors">Edit</a>
                  <button onClick={() => removeBook(book.id)} className="text-xs text-muted hover:text-red-500 transition-colors">Remove</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
