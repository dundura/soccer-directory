import { AnytimeInlineCTA } from "@/components/ui";
import type { Metadata } from "next";

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Auth Placeholder */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-border p-8 md:p-10 text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-3">Sign in to manage your listings</h2>
            <p className="text-muted mb-6">Create a free account to list your club, team, camp, or training services on SoccerFinder.</p>
            
            {/* Auth form placeholder */}
            <div className="space-y-3 mb-6">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <button className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors">
                Sign In
              </button>
            </div>

            <p className="text-sm text-muted">
              Don&apos;t have an account?{" "}
              <a href="#" className="text-accent-hover font-semibold hover:underline">Sign up free</a>
            </p>
          </div>

          {/* What you can do */}
          <div className="bg-surface rounded-2xl p-6 md:p-8">
            <h3 className="font-[family-name:var(--font-display)] font-bold mb-4">With a free account you can:</h3>
            <div className="space-y-3 text-sm text-muted">
              <div className="flex items-start gap-3">
                <span className="text-accent text-lg mt-0.5">✓</span>
                <span>Create listings for your club, teams, camps, or training services</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-lg mt-0.5">✓</span>
                <span>Edit your information anytime — changes go live instantly</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-lg mt-0.5">✓</span>
                <span>Post guest player opportunities for tournaments</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-lg mt-0.5">✓</span>
                <span>Get discovered by thousands of soccer families</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent text-lg mt-0.5">✓</span>
                <span>Access Anytime Soccer Training team plans at a special rate</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto mt-8">
          <AnytimeInlineCTA />
        </div>
      </div>
    </>
  );
}
