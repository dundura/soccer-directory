import { getInstagramPages } from "@/lib/db";
import { InstagramPageFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Instagram Pages | Soccer Near Me",
  description: "Discover soccer Instagram pages — training tips, match highlights, player profiles, and community content.",
};

export default async function InstagramPagesPage() {
  const pages = await getInstagramPages();
  return <InstagramPageFilters pages={pages} />;
}
