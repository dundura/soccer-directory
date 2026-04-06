import { getSoccerBookBySlug, getBookMediaAppearanceBySlug, getListingOwner } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShareButtons, VideoEmbed } from "@/components/profile-ui";
import { ClickableImage } from "@/components/clickable-image";
import { MediaAppearanceDetail } from "./detail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; appearanceSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, appearanceSlug } = await params;
  const book = await getSoccerBookBySlug(slug);
  if (!book) return {};
  const appearance = await getBookMediaAppearanceBySlug(book.id, appearanceSlug);
  if (!appearance) return {};

  const plainDescription = appearance.description
    ? appearance.description.replace(/<[^>]*>/g, "").trim()
    : `${appearance.title} - media appearance from ${book.name}`;

  const ogImage = appearance.previewImage || getVideoThumbnail(appearance.url ?? undefined) || undefined;
  const images = ogImage ? [{ url: ogImage, width: 1280, height: 720, alt: appearance.title }] : undefined;
  const pageUrl = `https://www.soccer-near-me.com/books-and-authors/${slug}/media/${appearance.slug || appearance.id}`;

  return {
    title: `${appearance.title} | ${book.name} | Soccer Near Me`,
    description: plainDescription,
    openGraph: {
      title: `${appearance.title} | ${book.name}`,
      description: plainDescription,
      url: pageUrl,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${appearance.title} | ${book.name}`,
      description: plainDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function getVideoThumbnail(url?: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    else if (url.includes("v=")) videoId = url.split("v=")[1]?.split("&")[0] || "";
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return null;
}

export default async function MediaAppearancePage({ params }: Props) {
  const { slug, appearanceSlug } = await params;
  const book = await getSoccerBookBySlug(slug);
  if (!book) notFound();
  const appearance = await getBookMediaAppearanceBySlug(book.id, appearanceSlug);
  if (!appearance) notFound();
  const ownerId = await getListingOwner("soccerbook", slug);

  const pageUrl = `https://www.soccer-near-me.com/books-and-authors/${slug}/media/${appearance.slug || appearance.id}`;
  const isVideo = appearance.url && (appearance.url.includes("youtube.com") || appearance.url.includes("youtu.be"));

  return (
    <>
      <div className="max-w-[900px] mx-auto px-6 py-3.5 text-sm text-muted">
        <a href="/books-and-authors" className="text-primary hover:underline">Books</a>
        {" › "}
        <a href={`/books-and-authors/${slug}`} className="text-primary hover:underline">{book.name}</a>
        {" › "}
        <span>{appearance.title}</span>
      </div>

      <div className="max-w-[900px] mx-auto px-6 pb-16">
        {/* Edit section for owner */}
        <MediaAppearanceDetail appearance={appearance} bookId={book.id} bookSlug={slug} ownerId={ownerId} />

        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6">
          {appearance.previewImage && (
            <ClickableImage src={appearance.previewImage} alt={appearance.title} className="w-full max-h-[500px] object-contain cursor-zoom-in" />
          )}
          <div className="p-6 sm:p-8">
            <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase tracking-tight leading-tight mb-3">
              {appearance.title}
            </h1>
            <p className="text-sm text-muted mb-4">
              From <a href={`/books-and-authors/${slug}`} className="text-accent hover:underline">{book.name}</a>
              {" · "}by {book.author}
            </p>

            {appearance.description && (
              <div className="text-primary leading-relaxed mb-6 prose prose-sm max-w-none [&>p]:mb-4 [&>p:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: appearance.description }} />
            )}

            {/* Video Embed */}
            {isVideo && appearance.url && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <VideoEmbed url={appearance.url} />
              </div>
            )}

            {/* Link button for non-video */}
            {appearance.url && !isVideo && (
              <div className="mb-6">
                <a href={appearance.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors">
                  Read Article →
                </a>
              </div>
            )}

            {/* CTA Buttons */}
            {[
              { label: appearance.cta1Label, url: appearance.cta1Url },
              { label: appearance.cta2Label, url: appearance.cta2Url },
              { label: appearance.cta3Label, url: appearance.cta3Url },
            ].some(b => b.label && b.url) && (
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { label: appearance.cta1Label, url: appearance.cta1Url },
                  { label: appearance.cta2Label, url: appearance.cta2Url },
                  { label: appearance.cta3Label, url: appearance.cta3Url },
                ].filter(b => b.label && b.url).map((b, i) => (
                  <a key={i} href={b.url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors">
                    {b.label}
                  </a>
                ))}
              </div>
            )}

            <ShareButtons url={pageUrl} title={`${appearance.title} | ${book.name}`} />

            <div className="mt-6 pt-4 border-t border-border">
              <a href={`/books-and-authors/${slug}`} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
                &larr; Back to {book.name}
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
