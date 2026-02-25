import { Suspense } from "react";
import { getClubs } from "@/lib/db";
import { ClubFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Youth Soccer Clubs | Soccer Near Me",
  description: "Find youth soccer clubs near you. Browse verified clubs across ECNL, MLS Next, GA, and recreational leagues.",
};

export default async function ClubsPage() {
  const clubs = await getClubs();
  return <Suspense><ClubFilters clubs={clubs} /></Suspense>;
}
