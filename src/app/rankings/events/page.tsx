import EventRankingsPage from "./events-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tournament Event Rankings | Soccer Near Me",
  description: "Top-ranked youth soccer tournaments across the US. Filter by gender, age group, and state. Live data from GotSport, updated weekly.",
};

export default function Page() {
  return <EventRankingsPage />;
}
