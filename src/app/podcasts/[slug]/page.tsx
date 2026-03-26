import { getPodcastBySlug, getPodcastSlugs, getListingOwner } from "@/lib/db";
import { fetchRssEpisodes } from "@/lib/rss";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VideoEmbed, PhotoGallery } from "@/components/profile-ui";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { FeaturedArticles } from "@/components/featured-articles";
import { ListingPostsSidebar } from "@/components/listing-posts";
import { ContactPodcastForm } from "./contact-form";
import { ReviewSection } from "@/components/review-section";
import { AnytimeInlineCTA } from "@/components/ui";
import { SponsorsSection } from "@/components/sponsors-section";
import { ClickableImage } from "@/components/clickable-image";
import { PodcastTopicsSection } from "@/components/podcast-topics";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getPodcastSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${podcast.name} — ${podcast.category} Podcast`,
    podcast.description || `${podcast.category} podcast hosted by ${podcast.hostName} from ${podcast.city}, ${podcast.state}.`,
    podcast.teamPhoto || podcast.imageUrl,
    `/podcasts/${slug}`,
  );
}

export default async function PodcastPage({ params }: Props) {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) notFound();

  const ownerId = await getListingOwner("podcast", slug);
  const rssEpisodes = podcast.rssFeedUrl ? await fetchRssEpisodes(podcast.rssFeedUrl, 10) : [];

  const imgPos = podcast.imagePosition ?? 50;
  const heroPos = podcast.heroImagePosition ?? 50;
  const heroImage = podcast.imageUrl || podcast.teamPhoto || "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";
  const sidebarImage = podcast.teamPhoto || podcast.logo || null;

  const infoRows = [
    { label: "Host", value: podcast.hostName },
    { label: "Category", value: podcast.category },
    { label: "Location", value: `${podcast.city}, ${podcast.state}` },
    ...(podcast.website ? [{ label: "Website", value: "Visit Website", href: podcast.website }] : []),
    ...(podcast.rssFeedUrl ? [{ label: "All Episodes", value: "Subscribe", href: podcast.website || podcast.rssFeedUrl }] : []),
    ...(podcast.phone ? [{ label: "Phone", value: podcast.phone }] : []),
    ...(podcast.email ? [{ label: "Email", value: "Contact", href: `/contact/podcast/${slug}`, internal: true }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* ── Sidebar ── */}
        <aside className="md:w-72 shrink-0 space-y-5">
          {/* Cover Art */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {sidebarImage ? (
              <ClickableImage src={sidebarImage} alt={podcast.name} className="w-full aspect-square object-cover" style={{ objectPosition: `center ${imgPos}%` }} />
            ) : (
              <div className="w-full aspect-square bg-primary flex items-center justify-center">
                <span className="text-6xl">🎙️</span>
              </div>
            )}
            {podcast.logo && sidebarImage !== podcast.logo && (
              <div className="absolute bottom-0 right-0 w-12 h-12 rounded-tl-xl bg-white p-1 shadow">
                <img src={podcast.logo} alt="" className="w-full h-full object-contain rounded-lg" />
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
                          <a href={row.href.startsWith("http") ? row.href : `https://${row.href}`} target="_blank" rel="noopener noreferrer" className="font-bold text-accent hover:text-accent-hover transition-colors">{row.value} ↗</a>
                        )
                      ) : (
                        <span className="font-bold text-primary">{row.value}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {podcast.socialMedia && (podcast.socialMedia.facebook || podcast.socialMedia.instagram) && (
              <div className="flex justify-center gap-4 py-3.5 border-t border-border">
                {podcast.socialMedia.instagram && (
                  <a href={podcast.socialMedia.instagram} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Instagram">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {podcast.socialMedia.facebook && (
                  <a href={podcast.socialMedia.facebook} target="_blank" className="w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Facebook">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Be a Guest CTA */}
          <a href="#be-a-guest" className="block w-full py-3 text-center rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors">
            Be a Guest
          </a>

          {ownerId && <ManageListingButton listingType="podcast" listingId={podcast.id} ownerId={ownerId} />}

          {/* Topics - desktop sidebar shortcut */}
          <div className="hidden md:block">
            <a href="#topics" className="block w-full py-2.5 text-center rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-colors">
              Topics & Episodes
            </a>
          </div>

          {/* Posts & Blog - desktop sidebar */}
          <div className="hidden md:block space-y-5">
            <ListingPostsSidebar listingType="podcast" listingId={podcast.id} slug={slug} ownerId={ownerId} />
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
            {heroImage.startsWith("color:") ? (
              <div className="w-full h-full" style={{ backgroundColor: heroImage.replace("color:", "") }} />
            ) : (
              <img src={heroImage} alt={podcast.name} className="w-full h-full object-cover" style={{ objectPosition: `center ${heroPos}%` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <InlineEditField ownerId={ownerId} listingType="podcast" listingId={podcast.id} field="name" value={podcast.name} tag="h1" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white uppercase leading-tight tracking-tight drop-shadow-lg" />
              {podcast.tagline && (
                <InlineEditField ownerId={ownerId} listingType="podcast" listingId={podcast.id} field="tagline" value={podcast.tagline} tag="p" className="text-white/80 text-sm font-medium" />
              )}
              <p className="text-white/70 text-sm">Hosted by {podcast.hostName} &middot; {podcast.city}, {podcast.state}</p>
            </div>
          </div>

          {/* About the Show */}
          {(podcast.description || podcast.website || podcast.followUrl) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-3">About the Show</h2>
              {podcast.description && (
                <InlineEditField ownerId={ownerId} listingType="podcast" listingId={podcast.id} field="description" value={podcast.description} tag="p" className="text-sm leading-relaxed text-gray-500 whitespace-pre-line" multiline />
              )}
              <div className="flex flex-wrap gap-3 mt-4">
                {podcast.website && (
                  <a
                    href={podcast.website.startsWith("http") ? podcast.website : `https://${podcast.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Listen Now
                  </a>
                )}
                {podcast.followUrl && (
                  <a
                    href={podcast.followUrl.startsWith("http") ? podcast.followUrl : `https://${podcast.followUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    Follow
                  </a>
                )}
                <a
                  href="#be-a-guest"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-surface transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Request a Topic
                </a>
              </div>
            </div>
          )}

          {/* Meet the Host */}
          {podcast.hostBio && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-4">{podcast.hostHeading || "Meet the Host"}</h2>
              <div className="flex flex-col sm:flex-row gap-5">
                {podcast.hostImage && (
                  <img src={podcast.hostImage} alt={podcast.hostHeading || "Meet the Host"} className="w-32 h-32 rounded-xl object-cover shrink-0" />
                )}
                <InlineEditField ownerId={ownerId} listingType="podcast" listingId={podcast.id} field="hostBio" value={podcast.hostBio} tag="p" className="text-sm leading-relaxed text-gray-500 whitespace-pre-line" multiline />
              </div>
            </div>
          )}

          {/* Podcast Topics */}
          <div id="topics">
            <PodcastTopicsSection podcastId={podcast.id} ownerId={ownerId} />
          </div>

          {/* Top Episodes (manual) */}
          {podcast.topEpisodes && podcast.topEpisodes.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Top Episodes</h2>
                <EditSectionLink ownerId={ownerId} listingType="podcast" listingId={podcast.id} />
              </div>
              <div className="space-y-3">
                {podcast.topEpisodes.map((ep, i) => (
                  <a
                    key={i}
                    href={ep.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-surface transition-colors group"
                  >
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <div className="min-w-0">
                      <span className="block font-semibold text-sm text-primary group-hover:text-accent-hover transition-colors">{ep.title}</span>
                      {ep.description && <span className="block text-xs text-muted mt-0.5 line-clamp-2">{ep.description}</span>}
                    </div>
                    <span className="shrink-0 text-muted text-xs ml-auto">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Recent Episodes (from RSS) */}
          {rssEpisodes.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Recent Episodes</h2>
                <EditSectionLink ownerId={ownerId} listingType="podcast" listingId={podcast.id} />
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
                        {ep.duration && <> &middot; {ep.duration}</>}
                      </span>
                    </div>
                    <span className="shrink-0 text-muted text-xs ml-auto">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Episode Videos */}
          {(podcast.videoUrl || podcast.videoUrl2 || podcast.videoUrl3) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Episode Videos</h2>
                <EditSectionLink ownerId={ownerId} listingType="podcast" listingId={podcast.id} />
              </div>
              <div className="space-y-4">
                {podcast.videoUrl && <VideoEmbed url={podcast.videoUrl} />}
                {podcast.videoUrl2 && <VideoEmbed url={podcast.videoUrl2} />}
                {podcast.videoUrl3 && <VideoEmbed url={podcast.videoUrl3} />}
              </div>
            </div>
          )}

          {/* Photos */}
          {podcast.photos && podcast.photos.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Photos</h2>
                <EditSectionLink ownerId={ownerId} listingType="podcast" listingId={podcast.id} />
              </div>
              <PhotoGallery photos={podcast.photos} imagePosition={podcast.imagePosition} />
            </div>
          )}

          {/* Posts - mobile only (shown in sidebar on desktop) */}
          <div className="md:hidden">
            <ListingPostsSidebar listingType="podcast" listingId={podcast.id} slug={slug} ownerId={ownerId} />
          </div>

          {/* Featured Articles */}
          <FeaturedArticles />

          {/* Be a Guest Form */}
          <div id="be-a-guest" className="bg-white rounded-2xl border-2 border-accent/20 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Be a Guest on This Podcast</h2>
              <EditSectionLink ownerId={ownerId} listingType="podcast" listingId={podcast.id} />
            </div>
            <p className="text-muted text-sm mb-5">Have a story to share or expertise to offer? Reach out to appear on {podcast.name}.</p>
            <ContactPodcastForm podcastName={podcast.name} slug={slug} />
          </div>

          {/* Reviews */}
          <ReviewSection listingType="podcast" listingId={podcast.id} />

          {/* ====== Sponsors ====== */}
          {podcast.sponsors && podcast.sponsors.length > 0 && (
            <div className="order-8 lg:order-none lg:col-start-2">
              <SponsorsSection sponsors={podcast.sponsors} />
            </div>
          )}

          {/* Recommended Resource CTA */}
          <AnytimeInlineCTA />
        </div>
      </div>
    </div>
  );
}
