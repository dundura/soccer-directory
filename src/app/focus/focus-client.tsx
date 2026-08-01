"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProjectFocus } from "@/components/project-focus";
import { ActiveClients } from "@/components/active-clients";
import { MarketingHub } from "@/components/marketing-hub";
import { NewsletterHub } from "@/components/newsletter-hub";
import { PostsHub } from "@/components/posts-hub";
import { DailyPlaybook } from "@/components/daily-playbook";
import { AffirmationTracker } from "@/components/affirmation-tracker";
import { ChoresTracker } from "@/components/chores-tracker";
import { WeightTracker } from "@/components/weight-tracker";
type Tab = "playbook" | "projects" | "clients" | "blog" | "newsletter" | "posts" | "affirmations" | "chores" | "weight";

const TAB_ORDER: Tab[] = ["playbook", "projects", "clients", "blog", "newsletter", "posts", "affirmations", "chores", "weight"];
const TAB_LABELS: Record<Tab, string> = {
  playbook:   "Daily Playbook",
  projects:   "Projects",
  clients:    "Active Clients",
  blog:       "Marketing",
  newsletter: "Email Newsletter",
  posts:      "Our Posts",
  affirmations: "Daily Affirmations",
  chores:     "Household Chores",
  weight:     "Weight Tracker",
};

export default function FocusClient() {
  const { status } = useSession();
  const router = useRouter();
  const [tab, setTabState] = useState<Tab>("playbook");

  useEffect(() => {
    const saved = sessionStorage.getItem("focusMainTab") as Tab | null;
    if (saved && TAB_ORDER.includes(saved)) setTabState(saved);
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
      {/* Nine tabs do not fit a phone. Below 820px they collapse into a
          select, which is native, thumb-friendly and needs no scrolling —
          rather than a row that runs off the edge with no sign it continues. */}
      <style>{`
        .focus-tabbar { display: flex; gap: 0; }
        .focus-tabpick { display: none; }
        @media (max-width: 820px) {
          .focus-tabbar { display: none; }
          .focus-tabpick { display: block; padding: 12px 0; }
        }
      `}</style>

      <div style={{ borderBottom: "2px solid #E1E8EF" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <div className="focus-tabpick">
            <label htmlFor="focus-tab-select" style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>
              Section
            </label>
            <select
              id="focus-tab-select"
              value={tab}
              onChange={(e) => setTab(e.target.value as Tab)}
              style={{
                width: "100%", padding: "12px 14px", fontSize: 15, fontWeight: 700,
                color: "#0F3154", background: "#fff", border: "2px solid #E1E8EF",
                borderRadius: 10, fontFamily: "inherit",
              }}
            >
              {TAB_ORDER.map(t => <option key={t} value={t}>{TAB_LABELS[t]}</option>)}
            </select>
          </div>

          <div className="focus-tabbar">
          {TAB_ORDER.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "14px 24px", fontSize: 14, fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "#0F3154" : "#94a3b8",
              background: "none", border: "none",
              borderBottom: tab === t ? "2px solid #0F3154" : "2px solid transparent",
              marginBottom: -2, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            }}>
              {TAB_LABELS[t]}
            </button>
          ))}
          </div>
        </div>
      </div>

      {tab === "playbook"   && <DailyPlaybook />}
      {tab === "projects"   && <ProjectFocus />}
      {tab === "clients"    && <ActiveClients />}
      {tab === "blog"       && <MarketingHub />}
      {tab === "newsletter" && <NewsletterHub />}
      {tab === "posts"      && <PostsHub />}
      {tab === "affirmations" && <AffirmationTracker />}
      {tab === "chores"       && <ChoresTracker />}
      {tab === "weight"       && <WeightTracker />}
    </div>
  );
}
