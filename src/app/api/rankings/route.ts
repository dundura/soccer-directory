import { NextResponse } from 'next/server';

const GOTSPORT_URL = 'https://system.gotsport.com/api/v1/team_ranking_data';

const REGION_NAMES: Record<number, string> = { 1: 'Northeast', 2: 'Midwest', 3: 'South', 4: 'West' };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gender = searchParams.get('gender') || 'm';
  const age    = searchParams.get('age')    || '14';
  const state  = searchParams.get('state') || 'national';

  try {
    const res = await fetch(GOTSPORT_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://rankings.gotsport.com/',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`GotSport returned ${res.status}`);
    const allTeams = await res.json();

    let filtered = allTeams.filter((t: Record<string, unknown>) =>
      t.gender === gender && String(t.age) === String(age)
    );

    if (state !== 'national') {
      filtered = filtered.filter((t: Record<string, unknown>) =>
        (t.team_association as string)?.toUpperCase() === state.toUpperCase()
      );
    }

    filtered.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      if (a.national_rank && b.national_rank) return (a.national_rank as number) - (b.national_rank as number);
      return ((b.total_points as number) || 0) - ((a.total_points as number) || 0);
    });

    const teams = filtered.map((t: Record<string, unknown>, i: number) => ({
      rank:         state !== 'national' ? ((t.association_rank as number) || i + 1) : ((t.national_rank as number) || i + 1),
      nationalRank: t.national_rank,
      regionalRank: t.regional_rank,
      stateRank:    t.association_rank,
      name:         t.team_name,
      club:         t.club_name,
      state:        t.team_association,
      region:       REGION_NAMES[t.team_region as number] || 'Unknown',
      wins:         t.total_wins    || 0,
      losses:       t.total_losses  || 0,
      draws:        t.total_draws   || 0,
      points:       t.total_points  || 0,
      bonusPoints:  t.bonus_points  || 0,
      winPercent:   parseFloat(String(t.win_percent  || 0)),
      goalRatio:    parseFloat(String(t.goal_ratio   || 0)),
      totalGoals:   t.total_goals         || 0,
      goalsAgainst: t.total_goals_against  || 0,
      matches:      t.total_matches        || 0,
      logoUrl:      t.logo_url ? `https://system.gotsport.com${t.logo_url}` : null,
      teamId:       t.team_id,
      rankingDate:  t.ranking_date,
    }));

    return NextResponse.json({
      teams,
      meta: {
        gender, age, state,
        total: teams.length,
        lastUpdated: filtered[0]?.ranking_date || new Date().toISOString(),
        source: 'GotSport',
      },
    });

  } catch (error) {
    console.error('Rankings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
