import { getPodcastBySlug, getPodcastSlugs, getListingOwner } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { ContactPodcastForm } from "./contact-form";

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

  const heroImage = podcast.imageUrl || podcast.teamPhoto || "https://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";
  const sidebarImage = podcast.teamPhoto || podcast.logo || null;

  const infoRows = [
    { label: "Host", value: podcast.hostName },
    { label: "Category", value: podcast.category },
    { label: "Location", value: `${podcast.city}, ${podcast.state}` },
    ...(podcast.website ? [{ label: "Website", value: "Visit Website", href: podcast.website }] : []),
    ...(podcast.rssFeedUrl ? [{ label: "All Episodes", value: "RSS Feed", href: podcast.rssFeedUrl }] : []),
    ...(podcast.phone ? [{ label: "Phone", value: podcast.phone }] : []),
    ...(podcast.email ? [{ label: "Email", value: podcast.email }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* ── Sidebar ── */}
        <aside className="md:w-72 shrink-0 space-y-5">
          {/* Cover Art */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {sidebarImage ? (
              <img src={sidebarImage} alt={podcast.name} className="w-full aspect-square object-cover" />
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
                        <a href={row.href.startsWith("http") ? row.href : `https://${row.href}`} target="_blank" rel="noopener noreferrer" className="font-bold text-accent hover:text-accent-hover transition-colors">{row.value} ↗</a>
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

          {ownerId && <ManageListingButton listingType="podcast" listingId={slug} ownerId={ownerId} />}
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
            <img src={heroImage} alt={podcast.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-white mb-1">{podcast.name}</h1>
              <p className="text-white/70 text-sm">Hosted by {podcast.hostName} &middot; {podcast.city}, {podcast.state}</p>
            </div>
          </div>

          {/* About */}
          {podcast.description && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-3">About</h2>
              <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">{podcast.description}</p>
            </div>
          )}

          {/* Top Episodes */}
          {podcast.topEpisodes && podcast.topEpisodes.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-4">Top Episodes</h2>
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

          {/* RSS Feed Link */}
          {podcast.rssFeedUrl && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-3">All Episodes</h2>
              <a
                href={podcast.rssFeedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 110-2 1 1 0 010 2z" /></svg>
                Subscribe via RSS
              </a>
            </div>
          )}

          {/* Episode Videos */}
          {(podcast.videoUrl || podcast.videoUrl2 || podcast.videoUrl3) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-4">Episode Videos</h2>
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
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-4">Photos</h2>
              <PhotoGallery photos={podcast.photos} />
            </div>
          )}

          {/* Be a Guest Form */}
          <div id="be-a-guest" className="bg-white rounded-2xl border-2 border-accent/20 p-6">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-1">Be a Guest on This Podcast</h2>
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

          {/* Anytime CTA */}
          <div className="bg-primary rounded-2xl p-6 text-center">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Powered by</p>
            <a href="https://anytime-soccer.com" target="_blank" rel="noopener" className="text-white font-[family-name:var(--font-display)] text-xl font-bold hover:text-accent transition-colors">
              Anytime Soccer Training
            </a>
            <p className="text-white/50 text-sm mt-2">The #1 app for youth soccer development</p>
          </div>
        </div>
      </div>
    </div>
  );
}
