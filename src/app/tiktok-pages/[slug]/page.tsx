import { Suspense } from "react";
import { getTikTokPageBySlug, getTikTokPageSlugs, getListingOwner } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VideoEmbed, PhotoGallery } from "@/components/profile-ui";
import { ManageListingButton, EditSectionLink } from "@/components/manage-listing-button";
import { InlineEditField } from "@/components/inline-edit";
import { FeaturedArticles } from "@/components/featured-articles";
import { ListingPostsSidebar } from "@/components/listing-posts";
import { ContactPageForm } from "./contact-form";
import { AnytimeInlineCTA } from "@/components/ui";
import { SponsorsSection } from "@/components/sponsors-section";
import { ListingEventsSection } from "@/components/listing-events-section";

export const dynamic = "force-dynamic";

const DEFAULT_SIDEBAR_PHOTO = "https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/1772852025436-kdk49t.jpg";
const DEFAULT_HERO_PHOTO = "https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/1772852080922-k37zwx.png";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getTikTokPageSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getTikTokPageBySlug(slug);
  if (!page) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${page.name} — ${page.category} TikTok Page`,
    page.description || `${page.category} TikTok page managed by ${page.ownerName}.`,
    page.teamPhoto || page.imageUrl,
    `/tiktok-pages/${slug}`,
  );
}

export default async function TikTokPagePage({ params }: Props) {
  const { slug } = await params;
  const page = await getTikTokPageBySlug(slug);
  if (!page) notFound();

  const ownerId = await getListingOwner("tiktokpage", slug);

  const imgPos = page.imagePosition ?? 50;
  const heroPos = page.heroImagePosition ?? 50;
  const GENERIC_HERO = "https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";
  const GENERIC_SIDEBAR = "https://media.anytime-soccer.com/wp-content/uploads/2026/01/idf.webp";
  const heroImage = (page.imageUrl && page.imageUrl !== GENERIC_HERO) ? page.imageUrl : DEFAULT_HERO_PHOTO;
  const sidebarImage = (page.teamPhoto && page.teamPhoto !== GENERIC_SIDEBAR) ? page.teamPhoto : page.logo || DEFAULT_SIDEBAR_PHOTO;

  const videos = [page.videoUrl, page.videoUrl2, page.videoUrl3].filter(Boolean);

  const infoRows = [
    { label: "Owner", value: page.ownerName },
    { label: "Category", value: page.category },
    ...(page.country && page.country !== "United States" ? [{ label: "Country", value: page.country }] : []),
    ...(page.followerCount ? [{ label: "Followers", value: page.followerCount }] : []),
    ...(page.pageUrl ? [{ label: "TikTok", value: "Visit Page", href: page.pageUrl }] : []),
    ...(page.website ? [{ label: "Website", value: "Visit Website", href: page.website }] : []),
    ...(page.email ? [{ label: "Email", value: "Contact", href: `/contact/tiktokpage/${slug}`, internal: true }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-72 shrink-0 space-y-5">
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <img src={sidebarImage} alt={page.name} className="w-full aspect-square object-cover" style={{ objectPosition: `center ${imgPos}%` }} />
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {infoRows.map((row, i) => (
                  <tr key={row.label} className={i > 0 ? "border-t border-border" : ""}>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{row.label}</td>
                    <td className="px-4 py-3 text-right break-all">
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

          {page.pageUrl && (
            <a href={page.pageUrl.startsWith("http") ? page.pageUrl : `https://${page.pageUrl}`} target="_blank" rel="noopener noreferrer" className="block w-full py-3 text-center rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition-colors">
              Follow Page
            </a>
          )}

          {ownerId && <ManageListingButton listingType="tiktokpage" listingId={page.id} ownerId={ownerId} />}
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
            <img src={heroImage} alt={page.name} className="w-full h-full object-cover" style={{ objectPosition: `center ${heroPos}%` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
          </div>

          {/* About */}
          {(page.description || page.pageUrl) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-extrabold text-primary uppercase tracking-tight mb-3">{page.name}</h2>
              {page.description && (
                <InlineEditField ownerId={ownerId} listingType="tiktokpage" listingId={page.id} field="description" value={page.description} tag="p" className="text-sm leading-relaxed text-gray-500 whitespace-pre-line" multiline />
              )}
              {page.pageUrl && (
                <a
                  href={page.pageUrl.startsWith("http") ? page.pageUrl : `https://${page.pageUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.2 8.2 0 004.77 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/></svg>
                  Follow Page
                </a>
              )}
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-extrabold text-primary uppercase tracking-tight">Videos</h2>
                <EditSectionLink ownerId={ownerId} listingType="tiktokpage" listingId={page.id} />
              </div>
              <div className="space-y-4">
                {videos.map((url, i) => (
                  <VideoEmbed key={i} url={url!} />
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {page.photos && page.photos.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-extrabold text-primary uppercase tracking-tight">Photos</h2>
                <EditSectionLink ownerId={ownerId} listingType="tiktokpage" listingId={page.id} />
              </div>
              <PhotoGallery photos={page.photos} imagePosition={page.imagePosition} />
            </div>
          )}

          {/* Events */}
          <ListingEventsSection listingType="tiktokpage" listingId={page.id} listingSlug={slug} ownerId={ownerId} />

          <FeaturedArticles />

          <ListingPostsSidebar listingType="tiktokpage" listingId={page.id} slug={slug} ownerId={ownerId} />

          {/* Contact Form */}
          <div id="contact" className="bg-white rounded-2xl border-2 border-accent/20 p-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-extrabold text-primary uppercase tracking-tight mb-1">Contact Page Owner</h2>
            <p className="text-muted text-sm mb-5">Have a question about {page.name}? Send a message to the page owner.</p>
            <ContactPageForm pageName={page.name} slug={slug} />
          </div>

          {/* Sponsors */}
          {page.sponsors && page.sponsors.length > 0 && (
            <div className="order-8 lg:order-none lg:col-start-2">
              <SponsorsSection sponsors={page.sponsors} />
            </div>
          )}

          <AnytimeInlineCTA />
        </div>
      </div>
    </div>
  );
}
