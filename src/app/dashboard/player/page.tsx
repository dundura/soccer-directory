import { Suspense } from "react";
import PlayerDashboardClient from "./player-dashboard-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Player Dashboard | Soccer Near Me",
  description: "Manage your player calendar, goals, training log, game stats, and notes.",
};

export default function PlayerDashboardPage() {
  return (
    <>
      <div className="bg-primary text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-2">Player Dashboard</h1>
          <p className="text-white/70 text-lg">Track your development, set goals, and log your progress</p>
        </div>
      </div>
      <div className="bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Suspense fallback={<div className="text-center py-12 text-muted">Loading...</div>}>
            <PlayerDashboardClient />
          </Suspense>
        </div>
      </div>
    </>
  );
}
