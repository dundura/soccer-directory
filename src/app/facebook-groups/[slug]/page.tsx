import { getFacebookGroupBySlug, getFacebookGroupSlugs, getListingOwner } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VideoEmbed, PhotoGallery, SocialLinks } from "@/components/profile-ui";
import { ManageListingButton } from "@/components/manage-listing-button";
import { ContactGroupForm } from "./contact-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getFacebookGroupSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const group = await getFacebookGroupBySlug(slug);
  if (!group) return {};
  const { ogMeta } = await import("@/lib/og");
  return ogMeta(
    `${group.name} — ${group.category} Facebook Group`,
    group.description || `${group.category} Facebook group managed by ${group.adminName}.`,
    group.teamPhoto || group.imageUrl,
    `/facebook-groups/${slug}`,
  );
}

export default async function FacebookGroupPage({ params }: Props) {
  const { slug } = await params;
  const group = await getFacebookGroupBySlug(slug);
  if (!group) notFound();

  const ownerId = await getListingOwner("fbgroup", slug);

  const imgPos = group.imagePosition ?? 50;
  const heroImage = group.imageUrl || "https://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";
  const sidebarImage = group.teamPhoto || group.logo || null;

  const infoRows = [
    { label: "Admin", value: group.adminName },
    { label: "Category", value: group.category },
    { label: "Privacy", value: group.privacy },
    ...(group.city && group.state ? [{ label: "Location", value: `${group.city}, ${group.state}` }] : []),
    ...(group.memberCount ? [{ label: "Members", value: group.memberCount }] : []),
    ...(group.groupUrl ? [{ label: "Facebook", value: "Visit Group", href: group.groupUrl }] : []),
    ...(group.phone ? [{ label: "Phone", value: group.phone }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* ── Sidebar ── */}
        <aside className="md:w-72 shrink-0 space-y-5">
          {/* Group Image */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            {sidebarImage ? (
              <img src={sidebarImage} alt={group.name} className="w-full aspect-square object-cover" style={{ objectPosition: `center ${imgPos}%` }} />
            ) : (
              <div className="w-full aspect-square bg-primary flex items-center justify-center">
                <span className="text-6xl">👥</span>
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
                    <td className="px-4 py-3 text-right break-all">
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

          {/* Join Group CTA */}
          {group.groupUrl && (
            <a href={group.groupUrl.startsWith("http") ? group.groupUrl : `https://${group.groupUrl}`} target="_blank" rel="noopener noreferrer" className="block w-full py-3 text-center rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors">
              Join Group
            </a>
          )}

          {ownerId && <ManageListingButton listingType="fbgroup" listingId={group.id} ownerId={ownerId} />}
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-64">
            {heroImage.startsWith("color:") ? (
              <div className="w-full h-full" style={{ backgroundColor: heroImage.replace("color:", "") }} />
            ) : (
              <img src={heroImage} alt={group.name} className="w-full h-full object-cover" style={{ objectPosition: `center ${imgPos}%` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-white mb-1">{group.name}</h1>
              <p className="text-white/70 text-sm">Admin: {group.adminName}{group.city && group.state ? ` \u00b7 ${group.city}, ${group.state}` : ""}</p>
            </div>
          </div>

          {/* About */}
          {(group.description || group.groupUrl) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-3">About This Group</h2>
              {group.description && <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">{group.description}</p>}
              {group.groupUrl && (
                <a
                  href={group.groupUrl.startsWith("http") ? group.groupUrl : `https://${group.groupUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Join Group
                </a>
              )}
            </div>
          )}

          {/* Videos */}
          {group.videoUrl && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-4">Videos</h2>
              <VideoEmbed url={group.videoUrl} />
            </div>
          )}

          {/* Photos */}
          {group.photos && group.photos.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-4">Photos</h2>
              <PhotoGallery photos={group.photos} imagePosition={group.imagePosition} />
            </div>
          )}

          {/* Contact Form */}
          <div id="contact" className="bg-white rounded-2xl border-2 border-accent/20 p-6">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary mb-1">Contact Group Admin</h2>
            <p className="text-muted text-sm mb-5">Have a question about {group.name}? Send a message to the group admin.</p>
            <ContactGroupForm groupName={group.name} slug={slug} />
          </div>

          {/* Social Links */}
          {group.socialMedia && (
            <SocialLinks
              website={group.groupUrl}
              facebook={group.socialMedia.facebook}
              instagram={group.socialMedia.instagram}
            />
          )}

          {/* Anytime CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-light p-6 text-white">
            <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-1">Recommended Resource</p>
            <h2 className="text-[22px] font-extrabold text-white tracking-tight mb-1.5">Supplement Team Training with 5,000+ Videos</h2>
            <p className="text-white/70 text-sm mb-4">Anytime Soccer Training offers structured follow-along sessions your player can do at home, in the backyard, or at the park.</p>
            <a href="https://anytime-soccer.com?ref=soccernearme" target="_blank" rel="noopener" className="inline-flex items-center px-5 py-2.5 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors">
              Try It Free →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
