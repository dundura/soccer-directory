import { Suspense } from "react";
import { getEbooks } from "@/lib/db";
import { EbookFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ebooks | Soccer Near Me",
  description: "Download free soccer ebooks for players, coaches, and parents. Training guides, tactics, and more.",
};

export default async function EbooksPage() {
  const ebooks = await getEbooks();
  return <Suspense><EbookFilters items={ebooks} /></Suspense>;
}
