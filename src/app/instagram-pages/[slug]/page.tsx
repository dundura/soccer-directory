import { Suspense } from "react";
import { getInstagramPageBySlug, getInstagramPageSlugs, getListingOwner } from "@/lib/db";
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

export const dynamic = "force-dynamic";

const DEFAULT_SIDEBAR_PHOTO = "https://media.anytime-soccer.com/wp-content/uploads/2026/01/idf.webp";
const DEFAULT_HERO_PHOTO = "https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/1772852257695-7gb8x6.jpg";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const slugs = await getInstagramPageSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getInstagramPageBySlug(slug);
  if (!page) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${page.name} — ${page.category} Instagram Page`,
    page.description || `${page.category} Instagram page managed by ${page.ownerName}.`,
    page.teamPhoto || page.imageUrl,
    `/instagram-pages/${slug}`,
  );
}

export default async function InstagramPagePage({ params }: Props) {
  const { slug } = await params;
  const page = await getInstagramPageBySlug(slug);
  if (!page) notFound();

  const ownerId = await getListingOwner("instagrampage", slug);

  const imgPos = page.imagePosition ?? 50;
  const heroPos = page.heroImagePosition ?? 50;
  const heroImage = page.imageUrl || DEFAULT_HERO_PHOTO;
  const sidebarImage = page.teamPhoto || page.logo || DEFAULT_SIDEBAR_PHOTO;

  const videos = [page.videoUrl, page.videoUrl2, page.videoUrl3].filter(Boolean);

  const infoRows = [
    { label: "Owner", value: page.ownerName },
    { label: "Category", value: page.category },
    ...(page.country && page.country !== "United States" ? [{ label: "Country", value: page.country }] : []),
    ...(page.followerCount ? [{ label: "Followers", value: page.followerCount }] : []),
    ...(page.pageUrl ? [{ label: "Instagram", value: "Visit Page", href: page.pageUrl }] : []),
    ...(page.website ? [{ label: "Website", value: "Visit Website", href: page.website }] : []),
    ...(page.email ? [{ label: "Email", value: "Contact", href: `/contact/instagrampage/${slug}`, internal: true }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* ── Sidebar ── */}
        <aside className="md:w-72 shrink-0 space-y-5">
          {/* Page Image */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <img src={sidebarImage} alt={page.name} className="w-full aspect-square object-cover" style={{ objectPosition: `center ${imgPos}%` }} />
          </div>

          {/* Info Table */}
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

          {/* Follow Page CTA */}
          {page.pageUrl && (
            <a href={page.pageUrl.startsWith("http") ? page.pageUrl : `https://${page.pageUrl}`} target="_blank" rel="noopener noreferrer" className="block w-full py-3 text-center rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors">
              Follow Page
            </a>
          )}

          {ownerId && <ManageListingButton listingType="instagrampage" listingId={page.id} ownerId={ownerId} />}
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
            <img src={heroImage} alt={page.name} className="w-full h-full object-cover" style={{ objectPosition: `center ${heroPos}%` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <InlineEditField ownerId={ownerId} listingType="instagrampage" listingId={page.id} field="name" value={page.name} tag="h1" className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-white mb-1" />
              {page.tagline && (
                <InlineEditField ownerId={ownerId} listingType="instagrampage" listingId={page.id} field="tagline" value={page.tagline} tag="p" className="text-white/80 text-sm font-medium" />
              )}
              <p className="text-white/70 text-sm">Owner: {page.ownerName}{page.country ? ` \u00b7 ${page.country}` : ""}</p>
            </div>
          </div>

          {/* About */}
          {(page.description || page.pageUrl) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-3">About This Page</h2>
              {page.description && (
                <InlineEditField ownerId={ownerId} listingType="instagrampage" listingId={page.id} field="description" value={page.description} tag="p" className="text-sm leading-relaxed text-gray-500 whitespace-pre-line" multiline />
              )}
              {page.pageUrl && (
                <a
                  href={page.pageUrl.startsWith("http") ? page.pageUrl : `https://${page.pageUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Follow Page
                </a>
              )}
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Videos</h2>
                <EditSectionLink ownerId={ownerId} listingType="instagrampage" listingId={page.id} />
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
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary">Photos</h2>
                <EditSectionLink ownerId={ownerId} listingType="instagrampage" listingId={page.id} />
              </div>
              <PhotoGallery photos={page.photos} imagePosition={page.imagePosition} />
            </div>
          )}

          <FeaturedArticles />

          <ListingPostsSidebar listingType="instagrampage" listingId={page.id} slug={slug} ownerId={ownerId} />

          {/* Contact Form */}
          <div id="contact" className="bg-white rounded-2xl border-2 border-accent/20 p-6">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-1">Contact Page Owner</h2>
            <p className="text-muted text-sm mb-5">Have a question about {page.name}? Send a message to the page owner.</p>
            <ContactPageForm pageName={page.name} slug={slug} />
          </div>

          {/* ====== Sponsors ====== */}
          {page.sponsors && page.sponsors.length > 0 && (
            <div className="order-8 lg:order-none lg:col-start-2">
              <SponsorsSection sponsors={page.sponsors} />
            </div>
          )}

          {/* Anytime CTA */}
          <AnytimeInlineCTA />
        </div>
      </div>
    </div>
  );
}
