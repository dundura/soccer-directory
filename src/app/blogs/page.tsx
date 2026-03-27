import { getBlogs, getBlogPosts, getMemberArticles } from "@/lib/db";
import { BlogFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Blogs | Soccer Near Me",
  description: "Discover soccer blogs covering youth development, coaching, player development, college recruiting, and more.",
};

export default async function BlogsPage() {
  const [blogs, blogPosts, memberArticles] = await Promise.all([getBlogs(), getBlogPosts(), getMemberArticles()]);
  const recentPosts = blogPosts.slice(0, 6).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    date: p.date,
    readTime: p.readTime,
    coverImage: p.coverImage,
    type: "blog" as const,
  }));
  const userPosts = memberArticles.slice(0, 10).map((p) => ({
    id: p.id,
    slug: p.slug || p.id,
    title: p.title || "",
    excerpt: p.body?.replace(/<[^>]*>/g, "").slice(0, 150) || "",
    category: "",
    date: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    readTime: "",
    coverImage: p.ogImageUrl || p.imageUrl || undefined,
    type: "post" as const,
  }));
  return <BlogFilters blogs={blogs} blogPosts={recentPosts} userPosts={userPosts} />;
}
