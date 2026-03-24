import { getPlayersWithHighlightVideos } from "@/lib/db";
import { VideoEmbed } from "@/components/profile-ui";
import { Badge } from "@/components/ui";
import { PlayerAvatar } from "@/components/player-avatar";
import type { Metadata } from "next";
import type { HighlightVideo } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Player Highlights | Soccer Near Me",
  description: "Watch highlight videos from youth soccer players across the country.",
};

export default async function PlayerHighlightsPage() {
  const players = await getPlayersWithHighlightVideos();

  // Collect all videos from all players
  const highlights: { video: HighlightVideo; player: typeof players[0] }[] = [];
  for (const player of players) {
    if (!player.highlightVideos) continue;
    for (const video of player.highlightVideos) {
      highlights.push({ video, player });
    }
  }

  return (
    <>
      {/* Hero */}
      <div className="relative bg-primary text-white py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-surface" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Player Highlights
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Watch highlight videos from youth soccer players across the country.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {highlights.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4 opacity-50">🎬</p>
            <p className="text-muted text-lg">No highlight videos yet. Players can add highlights from their profile dashboard.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {highlights.map(({ video, player }, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <VideoEmbed url={video.url} />
                </div>
                <div className="px-4 pb-4 flex items-center gap-3">
                  <PlayerAvatar
                    src={player.teamPhoto}
                    name={player.playerName}
                    className="w-10 h-10 rounded-full shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <a href={`/players/${player.slug}`} className="text-sm font-bold text-primary hover:text-accent transition-colors truncate block">
                      {player.playerName}
                    </a>
                    {video.title && <p className="text-xs text-muted truncate">{video.title}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge variant="blue">{player.position}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
