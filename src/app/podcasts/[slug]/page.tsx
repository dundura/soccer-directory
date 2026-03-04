import { getPodcastBySlug, getPodcastSlugs, getListingOwner } from "@/lib/db";
import { fetchRssEpisodes } from "@/lib/rss";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { ContactPodcastForm } from "./contact-form";
import { ReviewSection } from "@/components/review-section";
import { AnytimeInlineCTA } from "@/components/ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPodcastSlugs();
  return slugs.map((slug) => ({ slug }));
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
              <img src={sidebarImage} alt={podcast.name} className="w-full aspect-square object-cover" style={{ objectPosition: `center ${imgPos}%` }} />
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
          </div>

          {/* Be a Guest CTA */}
          <a href="#be-a-guest" className="block w-full py-3 text-center rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors">
            Be a Guest
          </a>

          {ownerId && <ManageListingButton listingType="podcast" listingId={podcast.id} ownerId={ownerId} />}
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
              <div className="flex items-center justify-between mb-1">
                <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-white">{podcast.name}</h1>
                <EditSectionLink ownerId={ownerId} listingType="podcast" listingId={podcast.id} />
              </div>
              {podcast.tagline && <p className="text-white/80 text-sm font-medium">{podcast.tagline}</p>}
              <p className="text-white/70 text-sm">Hosted by {podcast.hostName} &middot; {podcast.city}, {podcast.state}</p>
            </div>
          </div>

          {/* About the Show */}
          {(podcast.description || podcast.website || podcast.followUrl) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">About the Show</h2>
                <EditSectionLink ownerId={ownerId} listingType="podcast" listingId={podcast.id} />
              </div>
              {podcast.description && <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">{podcast.description}</p>}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">{podcast.hostHeading || "Meet the Host"}</h2>
                <EditSectionLink ownerId={ownerId} listingType="podcast" listingId={podcast.id} />
              </div>
              <div className="flex flex-col sm:flex-row gap-5">
                {podcast.hostImage && (
                  <img src={podcast.hostImage} alt={podcast.hostHeading || "Meet the Host"} className="w-32 h-32 rounded-xl object-cover shrink-0" />
                )}
                <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">{podcast.hostBio}</p>
              </div>
            </div>
          )}

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

          {/* Be a Guest Form */}
          <div id="be-a-guest" className="bg-white rounded-2xl border-2 border-accent/20 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Be a Guest on This Podcast</h2>
              <EditSectionLink ownerId={ownerId} listingType="podcast" listingId={podcast.id} />
            </div>
            <p className="text-muted text-sm mb-5">Have a story to share or expertise to offer? Reach out to appear on {podcast.name}.</p>
            <ContactPodcastForm podcastName={podcast.name} slug={slug} />
          </div>

          {/* Social Links */}
          {podcast.socialMedia && (
            <SocialLinks
              website={podcast.website}
              facebook={podcast.socialMedia.facebook}
              instagram={podcast.socialMedia.instagram}
            />
          )}

          {/* Reviews */}
          <ReviewSection listingType="podcast" listingId={podcast.id} />

          {/* Recommended Resource CTA */}
          <AnytimeInlineCTA />
        </div>
      </div>
    </div>
  );
}
