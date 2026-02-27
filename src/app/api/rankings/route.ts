import { NextResponse } from 'next/server';

const GOTSPORT_URL = 'https://system.gotsport.com/api/v1/team_ranking_data';

const REGION_NAMES: Record<number, string> = { 1: 'Northeast', 2: 'Midwest', 3: 'South', 4: 'West' };

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Referer': 'https://rankings.gotsport.com/',
};

// Max pages to fetch (20 results per page)
const MAX_PAGES = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gender = searchParams.get('gender') || 'm';
  const age    = searchParams.get('age')    || '14';
  const state  = searchParams.get('state') || 'national';

  try {
    // Build GotSport URL with Rails-style nested params
    const params = new URLSearchParams();
    params.set('search[gender]', gender);
    params.set('search[age]', age);
    params.set('search[team_country]', 'USA');
    params.set('search[page]', '1');

    if (state !== 'national') {
      params.set('search[team_association]', state.toUpperCase());
      params.set('search[filter_by]', 'state');
    }

    const url = `${GOTSPORT_URL}?${params.toString()}`;
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });

    if (!res.ok) throw new Error(`GotSport returned ${res.status}`);
    const json = await res.json();

    let allTeams = json.team_ranking_data || [];
    const pagination = json.pagination || {};
    const totalPages = Math.min(pagination.total_pages || 1, MAX_PAGES);

    // Fetch remaining pages in parallel (up to MAX_PAGES)
    if (totalPages > 1) {
      const pagePromises = [];
      for (let p = 2; p <= totalPages; p++) {
        const pageParams = new URLSearchParams(params);
        pageParams.set('search[page]', String(p));
        const pageUrl = `${GOTSPORT_URL}?${pageParams.toString()}`;
        pagePromises.push(
          fetch(pageUrl, { headers: HEADERS, next: { revalidate: 3600 } })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        );
      }
      const results = await Promise.all(pagePromises);
      for (const r of results) {
        if (r?.team_ranking_data) {
          allTeams = allTeams.concat(r.team_ranking_data);
        }
      }
    }

    const teams = allTeams.map((t: Record<string, unknown>, i: number) => ({
      rank:         state !== 'national'
        ? ((t.association_rank as number) || i + 1)
        : ((t.national_rank as number) || i + 1),
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
        totalAvailable: pagination.total_count || teams.length,
        lastUpdated: allTeams[0]?.ranking_date || new Date().toISOString(),
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
