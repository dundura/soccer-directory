import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getListingPostById, getListingPostBySlug, getListingNameById, getListingSlugById, getListingImages } from "@/lib/db";
import { ShareButtons } from "@/components/profile-ui";
import { PostEditableContent } from "@/components/post-editable";
import { AnytimeInlineCTA } from "@/components/ui";

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
  tournament: "tournaments", player: "guest-play/players", blog: "blogs",
  fbgroup: "facebook-groups", instagrampage: "instagram-pages", tiktokpage: "tiktok-pages", podcast: "podcasts", youtube: "youtube-channels",
  service: "services", trainingapp: "training-apps", ebook: "ebooks",
  giveaway: "giveaways", guest: "guest-play", trip: "international-trips",
  marketplace: "shop", fundraiser: "fundraiser",
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

  const [listingName, listingSlug, listingImages] = await Promise.all([
    getListingNameById(post.listingType, post.listingId),
    getListingSlugById(post.listingType, post.listingId),
    getListingImages(post.listingType, post.listingId),
  ]);

  const typePath = TYPE_PATHS[post.listingType] || "clubs";
  const typeLabel = TYPE_LABELS[post.listingType] || "Listings";
  const profileUrl = listingSlug ? `/${typePath}/${listingSlug}` : `/${typePath}`;
  const postUrl = `https://www.soccer-near-me.com/posts/${post.slug || post.id}`;
  const date = new Date(post.createdAt);
  const isBlog = !!post.title;

  // Strip inline styles so the blog-article-body CSS class controls formatting
  function stripInlineStyles(html: string): string {
    return html.replace(/\s*style="[^"]*"/gi, "");
  }

  // Auto-split long paragraphs (max 5 sentences per paragraph)
  function splitLongParagraphs(html: string): string {
    return html.replace(/<p>([\s\S]*?)<\/p>/gi, (match, inner) => {
      const text = inner.trim();
      if (!text) return match;
      // Split on sentence endings (. ! ?) followed by a space and uppercase letter
      const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
      if (sentences.length <= 5) return match;
      const chunks: string[] = [];
      for (let i = 0; i < sentences.length; i += 5) {
        chunks.push(`<p>${sentences.slice(i, i + 5).join(" ")}</p>`);
      }
      return chunks.join("\n");
    });
  }

  // Also handle non-wrapped text blocks (plain text without <p> tags)
  function ensureParagraphs(html: string): string {
    // If no <p> tags at all, wrap text blocks in <p>
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
  if (isBlog) enrichedBody = stripInlineStyles(enrichedBody);
  enrichedBody = splitLongParagraphs(enrichedBody);

  // Images only show if the user explicitly added them to the post

  // ── Blog post layout (matches /blog/[slug] style) ──
  if (isBlog) {
    return (
      <>
        {/* Navy header */}
        <div className="bg-primary text-white py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <a href={profileUrl} className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">
              &larr; {listingName || typeLabel}
            </a>
            <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mt-4 mb-3">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-white/50 text-sm">
              <span>{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              <span>&middot;</span>
              <span>{estimateReadTime(post.body)} read</span>
              {listingName && (
                <>
                  <span>&middot;</span>
                  <span>By {listingName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Cover image — fall back to listing image if none */}
            {(post.imageUrl || listingImages[0]) && (
              <div className="mb-8">
                <img src={post.imageUrl || listingImages[0]} alt="" className="w-full rounded-2xl object-cover max-h-[450px]" />
              </div>
            )}


            {/* Article body */}
            <div className="max-w-none mb-12">
              <PostEditableContent
                postId={post.id}
                title={post.title}
                body={enrichedBody}
                slug={post.slug || post.id}
                imageUrl={post.imageUrl}
                videoUrl={post.videoUrl}
                ctaUrl={post.ctaUrl}
                ctaLabel={post.ctaLabel}
                ogImageUrl={post.ogImageUrl}
                userId={post.userId}
                blogLayout
                profileName={listingName || undefined}
                profileUrl={listingSlug ? profileUrl : undefined}
              />
            </div>

            {/* Share */}
            <div className="py-6 border-t border-border mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Share this article</p>
              <ShareButtons url={postUrl} title={post.title || stripHtml(post.body).slice(0, 100)} />
            </div>

            {/* CTA */}
            <AnytimeInlineCTA />
          </div>
        </div>
      </>
    );
  }

  // ── Regular post layout (social-media-post card style) ──
  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-[700px] mx-auto px-6 py-3.5 text-sm text-muted">
        <a href={`/${typePath}`} className="text-primary hover:underline">{typeLabel}</a>
        {" \u203A "}
        {listingName && listingSlug && (
          <>
            <a href={profileUrl} className="text-primary hover:underline">{listingName}</a>
            {" \u203A "}
          </>
        )}
        <span>Post</span>
      </div>

      <div className="max-w-[700px] mx-auto px-6 pb-16">
        <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Author header */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
              {post.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[15px] font-bold text-primary leading-tight">{post.userName}</p>
              <p className="text-xs text-muted">
                {listingName && <><a href={profileUrl} className="hover:underline">{listingName}</a> &middot; </>}
                {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Editable body + slug */}
          <PostEditableContent
            postId={post.id}
            title={post.title}
            body={enrichedBody}
            slug={post.slug || post.id}
            imageUrl={post.imageUrl}
            videoUrl={post.videoUrl}
            ctaUrl={post.ctaUrl}
            ctaLabel={post.ctaLabel}
            ogImageUrl={post.ogImageUrl}
            userId={post.userId}
          />

          {/* Share */}
          <div className="px-6 py-4 border-t border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Share this post</p>
            <ShareButtons url={postUrl} title={stripHtml(post.body).slice(0, 100)} />
          </div>

          {/* Profile link */}
          {listingName && listingSlug && (
            <a
              href={profileUrl}
              className="flex items-center gap-4 mx-6 mb-6 px-5 py-4 rounded-xl bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                {listingName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary group-hover:text-accent transition-colors">{listingName}</p>
                <p className="text-xs text-muted">View full profile &rarr;</p>
              </div>
            </a>
          )}
        </article>
      </div>
    </>
  );
}
