import { getBlogPostBySlug, getBlogPostSlugs, getBlogPosts } from "@/lib/db";
import { Badge, AnytimeInlineCTA } from "@/components/ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return { title: `${post.title} | Soccer Near Me Blog`, description: post.excerpt };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  const blogPosts = await getBlogPosts();

  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/blog" className="text-white/50 text-sm hover:text-white transition-colors mb-4 inline-block">← All Articles</a>
          <Badge variant="orange">{post.category}</Badge>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mt-4 mb-3">{post.title}</h1>
          <div className="flex items-center gap-3 text-white/50 text-sm">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime} read</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Content — in production this would come from MDX or a headless CMS */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-muted text-lg leading-relaxed">{post.excerpt}</p>
          <div className="bg-surface rounded-2xl border border-border p-8 my-8 text-center">
            <p className="text-muted">📝 Full article content goes here.</p>
            <p className="text-sm text-muted mt-2">In production, blog posts are authored via MDX files or a headless CMS like Sanity, Contentful, or even WordPress as a headless backend.</p>
          </div>
        </div>

        {/* Anytime CTA at end of article */}
        <AnytimeInlineCTA />

        {/* Related Posts */}
        <div className="mt-12 pt-12 border-t border-border">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-6">Related Articles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {blogPosts
              .filter((p) => p.id !== post.id)
              .slice(0, 2)
              .map((p) => (
                <a
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group block bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition-all"
                >
                  <Badge variant="orange">{p.category}</Badge>
                  <h3 className="font-[family-name:var(--font-display)] font-bold mt-2 mb-1 group-hover:text-accent-hover transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-muted text-sm line-clamp-2">{p.excerpt}</p>
                </a>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
