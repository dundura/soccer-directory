import { Suspense } from "react";
import { BlogPostForm } from "./blog-post-form";

export default function CreateBlogPostPage() {
  return (
    <Suspense fallback={<div className="max-w-[800px] mx-auto px-6 py-16 text-center"><div className="animate-pulse text-muted">Loading...</div></div>}>
      <BlogPostForm />
    </Suspense>
  );
}
