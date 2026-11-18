import type { BookSeriesEntry } from "@/lib/types";

const DEFAULT_COVER = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";

type Props = {
  seriesName: string;
  books: BookSeriesEntry[];
  currentBookId: string;
};

export function BookSeriesSection({ seriesName, books, currentBookId }: Props) {
  return (
    <section className="border-t border-border pt-6 mt-6 mb-6" aria-labelledby="book-series-heading">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Book Series</p>
      <h2 id="book-series-heading" className="text-2xl md:text-3xl font-extrabold text-primary leading-tight tracking-tight mb-4">
        {seriesName}
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {books.map((book) => {
          const isCurrent = book.id === currentBookId;
          return (
            <li key={book.id}>
              <a
                href={`/books-and-authors/${book.slug}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`group block h-full rounded-xl border-2 p-3 transition-colors ${
                  isCurrent ? "border-accent bg-surface" : "border-border bg-white hover:border-accent"
                }`}
              >
                <div className="aspect-[2/3] mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-surface">
                  <img src={book.imageUrl || DEFAULT_COVER} alt="" loading="lazy" className="h-full w-full object-contain" />
                </div>
                {book.seriesOrder != null && (
                  <p className="text-xs font-semibold text-muted">Book {book.seriesOrder}</p>
                )}
                <p className="text-sm font-bold text-primary leading-snug group-hover:underline">{book.name}</p>
                {isCurrent && <p className="text-xs font-semibold text-accent-hover mt-1">Viewing now</p>}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
