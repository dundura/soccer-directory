import { Suspense } from "react";
import { getBlogPosts } from "@/lib/db";
import { BlogHub } from "./blog-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Blog | Tips, Guides & News for Soccer Parents | Soccer Near Me",
  description: "Expert guides on youth soccer: club selection, tryout prep, home training, player development pathways, and more.",
};

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  // Pass only what the client needs (no content HTML)
  const posts = blogPosts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    date: p.date,
    readTime: p.readTime,
    featured: p.featured,
    coverImage: p.coverImage,
  }));

  return (
    <Suspense>
      <BlogHub posts={posts} />
    </Suspense>
  );
}
