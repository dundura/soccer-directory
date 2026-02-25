import { Suspense } from "react";
import { getCamps } from "@/lib/db";
import { CampFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Camps & Clinics | Soccer Near Me",
  description: "Find soccer camps, clinics, ID camps, and college showcases near you. Register for summer 2026 programs now.",
};

export default async function CampsPage() {
  const camps = await getCamps();
  return <Suspense><CampFilters camps={camps} /></Suspense>;
}
