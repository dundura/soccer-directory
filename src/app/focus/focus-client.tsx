"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProjectFocus } from "@/components/project-focus";

export default function FocusClient() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/dashboard?redirect=/focus");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", color: "#6B7D8E" }}>
        Loading...
      </div>
    );
  }

  return <ProjectFocus />;
}
