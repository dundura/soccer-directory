import { Suspense } from "react";
import { getFacebookGroups } from "@/lib/db";
import { FacebookGroupFilters } from "./filters";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Soccer Facebook Groups | Soccer Near Me",
  description: "Find and join soccer Facebook groups for youth soccer, coaching, college recruiting, buy/sell/trade, and more.",
};

export default async function FacebookGroupsPage() {
  const groups = await getFacebookGroups();
  return <Suspense><FacebookGroupFilters groups={groups} /></Suspense>;
}
