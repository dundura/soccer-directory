"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ActiveClients } from "@/components/active-clients";
import { MarketingHub } from "@/components/marketing-hub";
import { NewsletterHub } from "@/components/newsletter-hub";
import { PostsHub } from "@/components/posts-hub";
import { DailyPlaybook } from "@/components/daily-playbook";
import { AffirmationTracker } from "@/components/affirmation-tracker";
import { ColdOutreach } from "@/components/cold-outreach";
type Tab = "playbook" | "clients" | "cold" | "blog" | "newsletter" | "posts" | "affirmations";

const TAB_ORDER: Tab[] = ["playbook", "clients", "cold", "blog", "newsletter", "posts", "affirmations"];
const TAB_LABELS: Record<Tab, string> = {
  playbook:   "Daily Playbook",
  clients:    "Active Clients",
  cold:       "Cold Outreach",
  blog:       "Marketing",
  newsletter: "Email Newsletter",
  posts:      "Our Posts",
  affirmations: "Daily Affirmations",
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
      {/* One dropdown at every width. A tab row for this many sections ran off
          the edge on a phone and read as clutter on a desktop. */}
      <style>{`
        .focus-tabpick { display: block; padding: 12px 0; max-width: 340px; }
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

        </div>
      </div>

      {tab === "playbook"   && <DailyPlaybook />}
      {tab === "clients"    && <ActiveClients />}
      {tab === "cold"       && <ColdOutreach />}
      {tab === "blog"       && <MarketingHub />}
      {tab === "newsletter" && <NewsletterHub />}
      {tab === "posts"      && <PostsHub />}
      {tab === "affirmations" && <AffirmationTracker />}
    </div>
  );
}
