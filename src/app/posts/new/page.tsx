import { Suspense } from "react";
import { CreatePostForm } from "./create-post-form";

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div className="max-w-[700px] mx-auto px-6 py-16 text-center"><div className="animate-pulse text-muted">Loading...</div></div>}>
      <CreatePostForm />
    </Suspense>
  );
}
