import DashboardClient from "./dashboard-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Manage Your Listings | Soccer Near Me",
  description: "Create and manage your club, team, trainer, or camp listings on Soccer Near Me.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
