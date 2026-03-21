import { Suspense } from "react";
import { PostForm } from "./post-form";

export default function NewPostPage() {
  return (
    <Suspense>
      <PostForm />
    </Suspense>
  );
}
