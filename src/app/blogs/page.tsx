import { getBlogs, getBlogPosts } from "@/lib/db";
import { BlogFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Blogs | Soccer Near Me",
  description: "Discover soccer blogs covering youth development, coaching, player development, college recruiting, and more.",
};

export default async function BlogsPage() {
  const [blogs, blogPosts] = await Promise.all([getBlogs(), getBlogPosts()]);
  const recentPosts = blogPosts.slice(0, 6).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    date: p.date,
    readTime: p.readTime,
    coverImage: p.coverImage,
  }));
  return <BlogFilters blogs={blogs} blogPosts={recentPosts} />;
}
