import { Suspense } from "react";
import { getServices } from "@/lib/db";
import { ServiceFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products & Services | Soccer Near Me",
  description: "Discover soccer products, services, and tools from trusted providers. Training equipment, apparel, recruiting services, and more.",
};

export default async function ServicesPage() {
  const services = await getServices();
  return <Suspense><ServiceFilters services={services} /></Suspense>;
}
