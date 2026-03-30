import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getListingPostById, getListingPostBySlug, getListingNameById, getListingSlugById, getListingImages, getListingOwnerIdById } from "@/lib/db";
import { ShareButtons, VideoEmbed } from "@/components/profile-ui";
import { PostEditableContent } from "@/components/post-editable";
import { ClickableImage } from "@/components/clickable-image";
import { AnytimeInlineCTA } from "@/components/ui";
import { PostDeleteButton } from "./post-delete";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const TYPE_LABELS: Record<string, string> = {
  club: "Clubs", team: "Teams", trainer: "Trainers",
  recruiter: "College Recruiting", futsal: "Futsal",
  camp: "Camps", specialevent: "Special Events", tryout: "Tryouts",
  tournament: "Tournaments", player: "Players", blog: "Blogs",
  fbgroup: "Facebook Groups", instagrampage: "Instagram Pages", tiktokpage: "TikTok Pages", podcast: "Podcasts", youtube: "YouTube Channels",
  service: "Services", trainingapp: "Training Apps", ebook: "Ebooks",
  giveaway: "Giveaways", guest: "Guest Play", trip: "International Trips",
  marketplace: "Shop", fundraiser: "Fundraisers",
};
const TYPE_PATHS: Record<string, string> = {
  club: "clubs", team: "teams", trainer: "trainers",
  recruiter: "college-recruiting", futsal: "futsal",
  camp: "camps", specialevent: "special-events", tryout: "tryouts",
  tournament: "tournaments", player: "players", blog: "blogs",
  fbgroup: "facebook-groups", instagrampage: "instagram-pages", tiktokpage: "tiktok-pages", podcast: "podcasts", youtube: "youtube-channels",
  service: "services", trainingapp: "training-apps", ebook: "ebooks",
  giveaway: "giveaways", guest: "guest-play", trip: "international-trips",
  marketplace: "shop", fundraiser: "fundraiser", soccerbook: "books-and-authors",
  photovideo: "photo-video-services", scrimmage: "scrimmages",
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}

function getVideoThumbnail(url?: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  return null;
}

function estimateReadTime(html: string): string {
  const words = stripHtml(html).split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

async function resolvePost(idOrSlug: string) {
  let post = await getListingPostById(idOrSlug);
  if (!post) post = await getListingPostBySlug(idOrSlug);
  return post;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await resolvePost(id);
  if (!post || post.hidden) return {};
  const listingName = await getListingNameById(post.listingType, post.listingId);
  const plainBody = stripHtml(post.body);
  const title = post.title || (listingName ? `${listingName} — ${plainBody.slice(0, 60) || "Update"}` : plainBody.slice(0, 60) || "Post");
  const description = post.title ? `${post.title} — ${plainBody.slice(0, 120)}` : plainBody.slice(0, 160);
  const ogImage = post.ogImageUrl || post.imageUrl || getVideoThumbnail(post.videoUrl) || "https://www.soccer-near-me.com/og-image.png";
  const canonical = post.slug ? `/posts/${post.slug}` : `/posts/${post.id}`;
  const finalImage = ogImage;

    // Extract YouTube embed URL for video OG tags
    function getEmbedUrl(videoUrl: string | null | undefined): string | null {
      if (!videoUrl) return null;
      const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
      const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      return null;
    }
    const embedUrl = getEmbedUrl(post.videoUrl);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        siteName: "Soccer Near Me",
        images: [{ url: finalImage, width: 1200, height: 630 }],
        url: `https://www.soccer-near-me.com${canonical}`,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [finalImage],
      },
      ...(embedUrl ? { other: {
        "og:video": embedUrl,
        "og:video:url": embedUrl,
        "og:video:secure_url": embedUrl,
        "og:video:type": "text/html",
        "og:video:width": "1280",
        "og:video:height": "720",
      } } : {}),
    };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await resolvePost(id);
  if (!post || post.hidden) notFound();

  const [listingName, listingSlug, listingImages, listingOwnerId] = await Promise.all([
    getListingNameById(post.listingType, post.listingId),
    getListingSlugById(post.listingType, post.listingId),
    getListingImages(post.listingType, post.listingId),
    getListingOwnerIdById(post.listingType, post.listingId),
  ]);

  const typePath = TYPE_PATHS[post.listingType] || "clubs";
  const typeLabel = TYPE_LABELS[post.listingType] || "Listings";
  const profileUrl = listingSlug ? `/${typePath}/${listingSlug}` : `/${typePath}`;
  const postUrl = `https://www.soccer-near-me.com/posts/${post.slug || post.id}`;
  const date = new Date(post.createdAt);
  // Auto-split long paragraphs (max 5 sentences per paragraph)
  function splitLongParagraphs(html: string): string {
    return html.replace(/<p>([\s\S]*?)<\/p>/gi, (match, inner) => {
      const text = inner.trim();
      if (!text) return match;
      const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
      if (sentences.length <= 5) return match;
      const chunks: string[] = [];
      for (let i = 0; i < sentences.length; i += 5) {
        chunks.push(`<p>${sentences.slice(i, i + 5).join(" ")}</p>`);
      }
      return chunks.join("\n");
    });
  }

  function ensureParagraphs(html: string): string {
    if (!/<p[\s>]/i.test(html)) {
      const lines = html.split(/\n\n+/);
      return lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        if (/^<(h[1-6]|ul|ol|blockquote|img|div|table|hr)/i.test(trimmed)) return trimmed;
        return `<p>${trimmed}</p>`;
      }).join("\n");
    }
    return html;
  }

  let enrichedBody = ensureParagraphs(post.body);
  enrichedBody = splitLongParagraphs(enrichedBody);

  // ── Episode-style post layout ──
  return (
    <>

      <div className="max-w-[900px] mx-auto px-6 pb-16">
        {/* Back to listing */}
        {listingName && listingSlug && (
          <div className="mb-4">
            <a href={profileUrl} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
              &larr; Back to {listingName}
            </a>
          </div>
        )}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {/* Preview image */}
          {(post.imageUrl || post.ogImageUrl) && (
            <ClickableImage
              src={post.ogImageUrl || post.imageUrl!}
              alt={post.title || "Post"}
              className="w-full max-h-[500px] object-contain bg-surface cursor-zoom-in"
            />
          )}

          <div className="p-6 sm:p-8">
            {/* Title */}
            {post.title && (
              <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary uppercase tracking-tight leading-tight mb-3">
                {post.title}
              </h1>
            )}

            {/* Meta */}
            <div className="flex items-center gap-3 text-sm text-muted mb-5">
              <span>{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              <span>&middot;</span>
              <span>{estimateReadTime(post.body)} read</span>
            </div>

            {/* Body */}
            <PostEditableContent
              postId={post.id}
              title={post.title}
              body={enrichedBody}
              blogLayout
              slug={post.slug || post.id}
              imageUrl={post.imageUrl}
              videoUrl={post.videoUrl}
              ctaUrl={post.ctaUrl}
              ctaLabel={post.ctaLabel}
              ogImageUrl={post.ogImageUrl}
              userId={post.userId}
              listingOwnerId={listingOwnerId || undefined}
              profileName={listingName || undefined}
              profileUrl={listingSlug ? profileUrl : undefined}
            />

            {/* CTA buttons */}
            {post.ctaUrl && post.ctaLabel && (
              <div className="mt-6">
                <a
                  href={post.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
                >
                  {post.ctaLabel} &rarr;
                </a>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Share this post</p>
              <ShareButtons url={postUrl} title={post.title || stripHtml(post.body).slice(0, 100)} />
            </div>

            {/* Back to listing + Delete */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              {listingName && listingSlug ? (
                <a href={profileUrl} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
                  &larr; Back to {listingName}
                </a>
              ) : <span />}
              <PostDeleteButton postId={post.id} postUserId={post.userId} listingOwnerId={listingOwnerId || undefined} backUrl={listingSlug ? profileUrl : undefined} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <AnytimeInlineCTA />
        </div>
      </div>
    </>
  );
}
