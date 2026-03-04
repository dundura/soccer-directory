import { getYoutubeChannels } from "@/lib/db";
import { YoutubeChannelFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer YouTube Channels | Soccer Near Me",
  description: "Discover YouTube channels covering soccer skills, coaching, match analysis, college recruiting, and more.",
};

export default async function YoutubeChannelsPage() {
  const channels = await getYoutubeChannels();
  return <YoutubeChannelFilters channels={channels} />;
}
