import { getBlogs, getMemberArticles } from "@/lib/db";
import { BlogFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Blogs | Soccer Near Me",
  description: "Discover soccer blogs covering youth development, coaching, player development, college recruiting, and more.",
};

export default async function BlogsPage() {
  const [blogs, articles] = await Promise.all([getBlogs(), getMemberArticles()]);
  return <BlogFilters blogs={blogs} articles={articles} />;
}
