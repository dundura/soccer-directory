import { getYoutubeChannelBySlug, getYoutubeChannelSlugs, getListingOwner } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { ContactYoutubeForm } from "./contact-form";
import { ReviewSection } from "@/components/review-section";
import { AnytimeInlineCTA } from "@/components/ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getYoutubeChannelSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const channel = await getYoutubeChannelBySlug(slug);
  if (!channel) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${channel.name} — ${channel.category} YouTube Channel`,
    channel.description || `${channel.category} YouTube channel created by ${channel.creatorName} from ${channel.city}, ${channel.state}.`,
    channel.teamPhoto || channel.imageUrl,
    `/youtube-channels/${slug}`,
  );
}

export default async function YoutubeChannelPage({ params }: Props) {
  const { slug } = await params;
  const channel = await getYoutubeChannelBySlug(slug);
  if (!channel) notFound();

  const ownerId = await getListingOwner("youtube", slug);

  const imgPos = channel.imagePosition ?? 50;
  const heroPos = channel.heroImagePosition ?? 50;
  const heroImage = channel.imageUrl || channel.teamPhoto || "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";
  const sidebarImage = channel.teamPhoto || channel.logo || null;

  const infoRows = [
    { label: "Creator", value: channel.creatorName },
    { label: "Category", value: channel.category },
    { label: "Location", value: `${channel.city}, ${channel.state}` },
    ...(channel.website ? [{ label: "Website", value: "Visit Website", href: channel.website }] : []),
    ...(channel.channelUrl ? [{ label: "Channel", value: "Watch on YouTube", href: channel.channelUrl }] : []),
    ...(channel.phone ? [{ label: "Phone", value: channel.phone }] : []),
    ...(channel.email ? [{ label: "Email", value: "Contact", href: `/contact/youtube/${slug}`, internal: true }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-72 shrink-0 space-y-5">
          {/* Channel Art */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {sidebarImage ? (
              <img src={sidebarImage} alt={channel.name} className="w-full aspect-square object-cover" style={{ objectPosition: `center ${imgPos}%` }} />
            ) : (
              <div className="w-full aspect-square bg-primary flex items-center justify-center">
                <span className="text-6xl">&#9654;</span>
              </div>
            )}
            {channel.logo && sidebarImage !== channel.logo && (
              <div className="absolute bottom-0 right-0 w-12 h-12 rounded-tl-xl bg-white p-1 shadow">
                <img src={channel.logo} alt="" className="w-full h-full object-contain rounded-lg" />
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

          {/* Collaborate CTA */}
          <a href="#collaborate" className="block w-full py-3 text-center rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors">
            Collaborate
          </a>

          {ownerId && <ManageListingButton listingType="youtube" listingId={channel.id} ownerId={ownerId} />}
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
            {heroImage.startsWith("color:") ? (
              <div className="w-full h-full" style={{ backgroundColor: heroImage.replace("color:", "") }} />
            ) : (
              <img src={heroImage} alt={channel.name} className="w-full h-full object-cover" style={{ objectPosition: `center ${heroPos}%` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <div className="flex items-center justify-between mb-1">
                <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-white">{channel.name}</h1>
                <EditSectionLink ownerId={ownerId} listingType="youtube" listingId={channel.id} />
              </div>
              {channel.tagline && <p className="text-white/80 text-sm font-medium">{channel.tagline}</p>}
              <p className="text-white/70 text-sm">Created by {channel.creatorName} &middot; {channel.city}, {channel.state}</p>
            </div>
          </div>

          {/* About the Channel */}
          {(channel.description || channel.channelUrl || channel.subscribeUrl) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">About the Channel</h2>
                <EditSectionLink ownerId={ownerId} listingType="youtube" listingId={channel.id} />
              </div>
              {channel.description && <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">{channel.description}</p>}
              <div className="flex flex-wrap gap-3 mt-4">
                {channel.channelUrl && (
                  <a
                    href={channel.channelUrl.startsWith("http") ? channel.channelUrl : `https://${channel.channelUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Watch Now
                  </a>
                )}
                {channel.subscribeUrl && (
                  <a
                    href={channel.subscribeUrl.startsWith("http") ? channel.subscribeUrl : `https://${channel.subscribeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    Subscribe
                  </a>
                )}
                <a
                  href="#collaborate"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-surface transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Suggest a Video
                </a>
              </div>
            </div>
          )}

          {/* Meet the Creator */}
          {channel.creatorBio && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">{channel.creatorHeading || "Meet the Creator"}</h2>
                <EditSectionLink ownerId={ownerId} listingType="youtube" listingId={channel.id} />
              </div>
              <div className="flex flex-col sm:flex-row gap-5">
                {channel.creatorImage && (
                  <img src={channel.creatorImage} alt={channel.creatorHeading || "Meet the Creator"} className="w-32 h-32 rounded-xl object-cover shrink-0" />
                )}
                <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">{channel.creatorBio}</p>
              </div>
            </div>
          )}

          {/* Featured Videos */}
          {channel.featuredVideos && channel.featuredVideos.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Featured Videos</h2>
                <EditSectionLink ownerId={ownerId} listingType="youtube" listingId={channel.id} />
              </div>
              <div className="space-y-3">
                {channel.featuredVideos.map((vid, i) => (
                  <a
                    key={i}
                    href={vid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-surface transition-colors group"
                  >
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <div className="min-w-0">
                      <span className="block font-semibold text-sm text-primary group-hover:text-accent-hover transition-colors">{vid.title}</span>
                      {vid.description && <span className="block text-xs text-muted mt-0.5 line-clamp-2">{vid.description}</span>}
                    </div>
                    <span className="shrink-0 text-muted text-xs ml-auto">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Channel Videos */}
          {(channel.videoUrl || channel.videoUrl2 || channel.videoUrl3) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Channel Videos</h2>
                <EditSectionLink ownerId={ownerId} listingType="youtube" listingId={channel.id} />
              </div>
              <div className="space-y-4">
                {channel.videoUrl && <VideoEmbed url={channel.videoUrl} />}
                {channel.videoUrl2 && <VideoEmbed url={channel.videoUrl2} />}
                {channel.videoUrl3 && <VideoEmbed url={channel.videoUrl3} />}
              </div>
            </div>
          )}

          {/* Photos */}
          {channel.photos && channel.photos.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Photos</h2>
                <EditSectionLink ownerId={ownerId} listingType="youtube" listingId={channel.id} />
              </div>
              <PhotoGallery photos={channel.photos} imagePosition={channel.imagePosition} />
            </div>
          )}

          {/* Collaborate Form */}
          <div id="collaborate" className="bg-white rounded-2xl border-2 border-accent/20 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Collaborate with This Channel</h2>
              <EditSectionLink ownerId={ownerId} listingType="youtube" listingId={channel.id} />
            </div>
            <p className="text-muted text-sm mb-5">Have a collaboration idea or video suggestion? Reach out to {channel.name}.</p>
            <ContactYoutubeForm channelName={channel.name} slug={slug} />
          </div>

          {/* Social Links */}
          {channel.socialMedia && (
            <SocialLinks
              website={channel.website}
              facebook={channel.socialMedia.facebook}
              instagram={channel.socialMedia.instagram}
            />
          )}

          {/* Reviews */}
          <ReviewSection listingType="youtube" listingId={channel.id} />

          {/* CTA */}
          <AnytimeInlineCTA />
        </div>
      </div>
    </div>
  );
}
