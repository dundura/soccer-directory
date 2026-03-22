import { Suspense } from "react";
import { getPhotoVideoServices } from "@/lib/db";
import { PhotoVideoFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photo & Video Services | Soccer Near Me",
  description: "Find soccer photographers, videographers, highlight reels, and event coverage services.",
};

export default async function PhotoVideoServicesPage() {
  const services = await getPhotoVideoServices();
  return <Suspense><PhotoVideoFilters services={services} /></Suspense>;
}
