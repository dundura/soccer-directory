import { getTikTokPages } from "@/lib/db";
import { TikTokPageFilters } from "./filters";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Soccer TikTok Pages | Soccer Near Me",
  description: "Discover soccer TikTok pages — training tips, match highlights, player profiles, and community content.",
};

export default async function TikTokPagesPage() {
  const pages = await getTikTokPages();
  return <TikTokPageFilters pages={pages} />;
}
