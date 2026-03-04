import { getBlogBySlug, getBlogSlugs, getListingOwner } from "@/lib/db";
import { fetchRssEpisodes } from "@/lib/rss";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { ContactBlogForm } from "./contact-form";
import { ReviewSection } from "@/components/review-section";
import { AnytimeInlineCTA } from "@/components/ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${blog.name} — ${blog.category} Blog`,
    blog.description || `${blog.category} blog by ${blog.authorName} from ${blog.city}, ${blog.state}.`,
    blog.teamPhoto || blog.imageUrl,
    `/blogs/${slug}`,
  );
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  const ownerId = await getListingOwner("blog", slug);
  const rssEpisodes = blog.rssFeedUrl ? await fetchRssEpisodes(blog.rssFeedUrl, 10) : [];

  const imgPos = blog.imagePosition ?? 50;
  const heroPos = blog.heroImagePosition ?? 50;
  const heroImage = blog.imageUrl || blog.teamPhoto || "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";
  const sidebarImage = blog.teamPhoto || blog.logo || null;

  const infoRows = [
    { label: "Author", value: blog.authorName },
    { label: "Category", value: blog.category },
    { label: "Location", value: `${blog.city}, ${blog.state}` },
    ...(blog.website ? [{ label: "Website", value: "Visit Blog", href: blog.website }] : []),
    ...(blog.subscribeUrl ? [{ label: "Subscribe", value: "Subscribe", href: blog.subscribeUrl }] : []),
    ...(blog.phone ? [{ label: "Phone", value: blog.phone }] : []),
    ...(blog.email ? [{ label: "Email", value: "Contact", href: `/contact/blog/${slug}`, internal: true }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* ── Sidebar ── */}
        <aside className="md:w-72 shrink-0 space-y-5">
          {/* Cover Art */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {sidebarImage ? (
              <img src={sidebarImage} alt={blog.name} className="w-full aspect-square object-cover" style={{ objectPosition: `center ${imgPos}%` }} />
            ) : (
              <div className="w-full aspect-square bg-primary flex items-center justify-center">
                <span className="text-6xl">&#9997;&#65039;</span>
              </div>
            )}
            {blog.logo && sidebarImage !== blog.logo && (
              <div className="absolute bottom-0 right-0 w-12 h-12 rounded-tl-xl bg-white p-1 shadow">
                <img src={blog.logo} alt="" className="w-full h-full object-contain rounded-lg" />
              </div>
            )}
          </div>

          {/* Info Table */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {infoRows.map((row, i) => (
                  <tr key={row.label} className={i > 0 ? "border-t border-border" : ""}>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{row.label}</td>
                    <td className="px-4 py-3 text-right">
                      {"href" in row && row.href ? (
                        "internal" in row && row.internal ? (
                          <a href={row.href} className="font-bold text-accent hover:text-accent-hover transition-colors">{row.value}</a>
                        ) : (
                          <a href={row.href.startsWith("http") ? row.href : `https://${row.href}`} target="_blank" rel="noopener noreferrer" className="font-bold text-accent hover:text-accent-hover transition-colors">{row.value} &#8599;</a>
                        )
                      ) : (
                        <span className="font-bold text-primary">{row.value}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Contact CTA */}
          <a href="#contact-author" className="block w-full py-3 text-center rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors">
            Contact Author
          </a>

          {ownerId && <ManageListingButton listingType="blog" listingId={blog.id} ownerId={ownerId} />}
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
            {heroImage.startsWith("color:") ? (
              <div className="w-full h-full" style={{ backgroundColor: heroImage.replace("color:", "") }} />
            ) : (
              <img src={heroImage} alt={blog.name} className="w-full h-full object-cover" style={{ objectPosition: `center ${heroPos}%` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <div className="flex items-center justify-between mb-1">
                <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-white">{blog.name}</h1>
                <EditSectionLink ownerId={ownerId} listingType="blog" listingId={blog.id} />
              </div>
              {blog.tagline && <p className="text-white/80 text-sm font-medium">{blog.tagline}</p>}
              <p className="text-white/70 text-sm">By {blog.authorName} &middot; {blog.city}, {blog.state}</p>
            </div>
          </div>

          {/* About the Blog */}
          {(blog.description || blog.website || blog.subscribeUrl) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">About the Blog</h2>
                <EditSectionLink ownerId={ownerId} listingType="blog" listingId={blog.id} />
              </div>
              {blog.description && <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">{blog.description}</p>}
              <div className="flex flex-wrap gap-3 mt-4">
                {blog.website && (
                  <a
                    href={blog.website.startsWith("http") ? blog.website : `https://${blog.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    Read Blog
                  </a>
                )}
                {blog.subscribeUrl && (
                  <a
                    href={blog.subscribeUrl.startsWith("http") ? blog.subscribeUrl : `https://${blog.subscribeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    Subscribe
                  </a>
                )}
                <a
                  href="#contact-author"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-surface transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Contact Author
                </a>
              </div>
            </div>
          )}

          {/* About the Author */}
          {blog.authorBio && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">{blog.authorHeading || "About the Author"}</h2>
                <EditSectionLink ownerId={ownerId} listingType="blog" listingId={blog.id} />
              </div>
              <div>
                {blog.authorImage && (
                  <img src={blog.authorImage} alt={blog.authorHeading || "About the Author"} className="float-left mr-4 mb-3 w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover" />
                )}
                <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">{blog.authorBio}</p>
                <div className="clear-both" />
              </div>
            </div>
          )}

          {/* Featured Posts (manual) */}
          {blog.featuredPosts && blog.featuredPosts.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Featured Posts</h2>
                <EditSectionLink ownerId={ownerId} listingType="blog" listingId={blog.id} />
              </div>
              <div className="space-y-3">
                {blog.featuredPosts.map((post, i) => (
                  <a
                    key={i}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-surface transition-colors group"
                  >
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <div className="min-w-0">
                      <span className="block font-semibold text-sm text-primary group-hover:text-accent-hover transition-colors">{post.title}</span>
                      {post.description && <span className="block text-xs text-muted mt-0.5 line-clamp-2">{post.description}</span>}
                    </div>
                    <span className="shrink-0 text-muted text-xs ml-auto">&#8599;</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Recent Posts (from RSS) */}
          {rssEpisodes.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Recent Posts</h2>
                <EditSectionLink ownerId={ownerId} listingType="blog" listingId={blog.id} />
              </div>
              <div className="space-y-3">
                {rssEpisodes.map((ep, i) => (
                  <a
                    key={i}
                    href={ep.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-surface transition-colors group"
                  >
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="block font-semibold text-sm text-primary group-hover:text-accent-hover transition-colors">{ep.title}</span>
                      {ep.description && <span className="block text-xs text-muted mt-0.5 line-clamp-2">{ep.description}</span>}
                      <span className="block text-xs text-muted mt-1">
                        {ep.pubDate && new Date(ep.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <span className="shrink-0 text-muted text-xs ml-auto">&#8599;</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {(blog.videoUrl || blog.videoUrl2 || blog.videoUrl3) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Videos</h2>
                <EditSectionLink ownerId={ownerId} listingType="blog" listingId={blog.id} />
              </div>
              <div className="space-y-4">
                {blog.videoUrl && <VideoEmbed url={blog.videoUrl} />}
                {blog.videoUrl2 && <VideoEmbed url={blog.videoUrl2} />}
                {blog.videoUrl3 && <VideoEmbed url={blog.videoUrl3} />}
              </div>
            </div>
          )}

          {/* Photos */}
          {blog.photos && blog.photos.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Photos</h2>
                <EditSectionLink ownerId={ownerId} listingType="blog" listingId={blog.id} />
              </div>
              <PhotoGallery photos={blog.photos} imagePosition={blog.imagePosition} />
            </div>
          )}

          {/* Contact Author Form */}
          <div id="contact-author" className="bg-white rounded-2xl border-2 border-accent/20 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Contact the Author</h2>
              <EditSectionLink ownerId={ownerId} listingType="blog" listingId={blog.id} />
            </div>
            <p className="text-muted text-sm mb-5">Have a question or want to collaborate? Reach out to {blog.authorName}.</p>
            <ContactBlogForm blogName={blog.name} slug={slug} />
          </div>

          {/* Social Links */}
          {blog.socialMedia && (
            <SocialLinks
              website={blog.website}
              facebook={blog.socialMedia.facebook}
              instagram={blog.socialMedia.instagram}
            />
          )}

          {/* Reviews */}
          <ReviewSection listingType="blog" listingId={blog.id} />

          {/* Recommended Resource CTA */}
          <AnytimeInlineCTA />
        </div>
      </div>
    </div>
  );
}
