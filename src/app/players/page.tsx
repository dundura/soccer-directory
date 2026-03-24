import { getPlayerProfiles } from "@/lib/db";
import { PlayerFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Player Profiles | Soccer Near Me",
  description: "Browse player profiles from youth soccer players looking for guest play opportunities, tryouts, and team placements.",
};

export default async function PlayersPage() {
  const players = await getPlayerProfiles();
  return <PlayerFilters players={players} />;
}
