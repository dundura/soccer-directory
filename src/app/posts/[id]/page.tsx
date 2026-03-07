import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getListingPostById, getListingPostBySlug, getListingNameById, getListingSlugById, getListingImageById } from "@/lib/db";
import { ShareButtons } from "@/components/profile-ui";
import { PostEditableContent } from "@/components/post-editable";

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
  // YouTube (regular + shorts)
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  // Vimeo - can't get thumbnail without API, return null
  return null;
}

async function resolvePost(idOrSlug: string) {
  // Try by ID first, then by slug
  let post = await getListingPostById(idOrSlug);
  if (!post) post = await getListingPostBySlug(idOrSlug);
  return post;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await resolvePost(id);
  if (!post || post.hidden) return {};
  const listingName = await getListingNameById(post.listingType, post.listingId);
  const { ogMeta } = await import("@/lib/og");
  const plainBody = stripHtml(post.body);
  const title = listingName ? `${listingName} — ${plainBody.slice(0, 60) || "Update"}` : plainBody.slice(0, 60) || "Post";
  const description = plainBody.slice(0, 160);
  const listingImage = await getListingImageById(post.listingType, post.listingId);
  const ogImage = post.imageUrl || getVideoThumbnail(post.videoUrl) || listingImage;
  const canonical = post.slug ? `/posts/${post.slug}` : `/posts/${post.id}`;
  return ogMeta(title, description, ogImage, canonical);
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await resolvePost(id);
  if (!post || post.hidden) notFound();

  const [listingName, listingSlug] = await Promise.all([
    getListingNameById(post.listingType, post.listingId),
    getListingSlugById(post.listingType, post.listingId),
  ]);

  const typePath = TYPE_PATHS[post.listingType] || "clubs";
  const typeLabel = TYPE_LABELS[post.listingType] || "Listings";
  const profileUrl = listingSlug ? `/${typePath}/${listingSlug}` : `/${typePath}`;
  const postUrl = `https://www.soccer-near-me.com/posts/${post.slug || post.id}`;
  const date = new Date(post.createdAt);

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
            body={post.body}
            slug={post.slug || post.id}
            imageUrl={post.imageUrl}
            videoUrl={post.videoUrl}
            ctaUrl={post.ctaUrl}
            ctaLabel={post.ctaLabel}
            userId={post.userId}
          />

          {/* Share */}
          <div className="px-6 py-4 border-t border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Share this post</p>
            <ShareButtons url={postUrl} title={stripHtml(post.body).slice(0, 100)} />
          </div>
        </article>

        {/* Back link */}
        {listingSlug && (
          <div className="mt-6 text-center">
            <a href={profileUrl} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
              &larr; Back to {listingName} profile
            </a>
          </div>
        )}
      </div>
    </>
  );
}
