"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProjectFocus } from "@/components/project-focus";
import { ActiveClients } from "@/components/active-clients";

type Tab = "projects" | "clients";

export default function FocusClient() {
  const { status } = useSession();
  const router = useRouter();
  const [tab, setTabState] = useState<Tab>("projects");

  useEffect(() => {
    const saved = sessionStorage.getItem("focusMainTab") as Tab | null;
    if (saved === "projects" || saved === "clients") setTabState(saved);
  }, []);

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

  const setTab = (t: Tab) => { setTabState(t); sessionStorage.setItem("focusMainTab", t); };

  return (
    <div style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
      {/* Tab bar */}
      <div style={{ borderBottom: "2px solid #E1E8EF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", gap: 0 }}>
          {(["projects", "clients"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "14px 24px", fontSize: 14, fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "#0F3154" : "#94a3b8",
              background: "none", border: "none",
              borderBottom: tab === t ? "2px solid #0F3154" : "2px solid transparent",
              marginBottom: -2, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            }}>
              {t === "projects" ? "Projects" : "Active Clients"}
            </button>
          ))}
        </div>
      </div>

      {tab === "projects" ? <ProjectFocus /> : <ActiveClients />}
    </div>
  );
}
