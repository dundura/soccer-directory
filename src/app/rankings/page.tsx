import { RankingsClient } from "./rankings-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Youth Soccer Rankings | Soccer Near Me",
  description: "National and state youth soccer team rankings across all age groups. Live data from GotSport, updated weekly.",
};

export default function RankingsPage() {
  return <RankingsClient />;
}
