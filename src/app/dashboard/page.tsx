import DashboardClient from "./dashboard-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Manage Your Listings | SoccerFinder",
  description: "Create and manage your club, team, trainer, or camp listings on SoccerFinder.",
};

export default function DashboardPage() {
  return (
    <>
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">Dashboard</h1>
          <p className="text-white/70 text-lg">Create and manage your listings</p>
        </div>
      </div>
      <DashboardClient />
    </>
  );
}
