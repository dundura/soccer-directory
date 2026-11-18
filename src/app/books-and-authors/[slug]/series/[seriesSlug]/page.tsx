import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSoccerBookBySlug, getListingOwner, getBookSeriesBySlug } from "@/lib/db";
import { ShareButtons } from "@/components/profile-ui";
import { SeriesDetail } from "./series-detail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; seriesSlug: string }> };

async function load(slug: string, seriesSlug: string) {
  const book = await getSoccerBookBySlug(slug);
  if (!book) return null;
  const series = await getBookSeriesBySlug(book.id, seriesSlug);
  if (!series) return null;
  return { book, series };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, seriesSlug } = await params;
  const found = await load(slug, seriesSlug);
  if (!found) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${found.series.title} Series | Books & Authors | Soccer Near Me`,
    found.series.description || `Every book in the ${found.series.title} series by ${found.book.author}.`,
    found.series.previewImage || found.series.books[0]?.imageUrl || found.book.imageUrl,
    `/books-and-authors/${slug}/series/${seriesSlug}`,
  );
}

export default async function BookSeriesPage({ params }: Props) {
  const { slug, seriesSlug } = await params;
  const found = await load(slug, seriesSlug);
  if (!found) notFound();
  const { book, series } = found;

  let ownerId: string | null = null;
  try {
    ownerId = await getListingOwner("soccerbook", slug);
  } catch {
    ownerId = null;
  }

  const pageUrl = `https://www.soccer-near-me.com/books-and-authors/${slug}/series/${seriesSlug}`;

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[900px] mx-auto px-6 py-3.5 text-sm text-muted">
        <a href="/books-and-authors" className="text-primary hover:underline">Books &amp; Authors</a>
        {" › "}
        <a href={`/books-and-authors/${slug}`} className="text-primary hover:underline">{book.name}</a>
        {" › "}
        <span>{series.title}</span>
      </div>

      <div className="max-w-[900px] mx-auto px-6 pb-16">
        {/* Series Header */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6">
          {series.previewImage && (
            <a href={series.previewImage} target="_blank" rel="noopener noreferrer">
              <img src={series.previewImage} alt={series.title} className="w-full max-h-[520px] object-contain cursor-pointer hover:opacity-90 transition-opacity" />
            </a>
          )}
          <div className="p-6 sm:p-8">
            <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase tracking-tight leading-tight mb-3">
              {series.title}
            </h1>
            {series.description && (
              <p className="text-primary/70 text-base leading-relaxed mb-4 whitespace-pre-line">{series.description}</p>
            )}
            <div className="flex items-center gap-3 text-sm text-muted mb-4">
              <span>{series.books.length} book{series.books.length !== 1 ? "s" : ""}</span>
              {book.author && (
                <>
                  <span>&middot;</span>
                  <a href={`/books-and-authors/${slug}`} className="text-accent hover:underline">{book.author}</a>
                </>
              )}
            </div>
            <ShareButtons url={pageUrl} title={`${series.title} | ${book.author || "Books & Authors"}`} />
          </div>
        </div>

        {/* Books */}
        <SeriesDetail bookId={book.id} ownerId={ownerId} series={series} />
      </div>
    </>
  );
}
