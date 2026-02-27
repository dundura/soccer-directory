import { NextResponse } from 'next/server';

const GOTSPORT_URL = 'https://system.gotsport.com/api/v1/event_ranking_data';

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
  'Referer': 'https://rankings.gotsport.com/',
};

// Cache the full dataset in memory for 24 hours to avoid re-fetching 83 pages on every request
let cachedEvents: GotSportEvent[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const REGION_NAMES: Record<string, string> = { '1':'Northeast', '2':'Midwest', '3':'South', '4':'West' };

interface GotSportEvent {
  id: number;
  event?: {
    id?: number;
    name?: string;
    city?: string;
    start_date_formatted?: { medium?: string; dashed?: string };
    end_date_formatted?: { medium?: string };
    tournament?: boolean;
    league?: boolean;
    image?: string;
    boys_ranking_category?: { title?: string; event_level?: number };
    girls_ranking_category?: { title?: string; event_level?: number };
  };
  state?: string;
  region?: string;
  playoffs?: boolean;
  boys_rank?: number;
  girls_rank?: number;
  combined_rank?: number;
  boys_team_count?: number;
  girls_team_count?: number;
  combined_team_count?: number;
  boys_age_groups?: string[];
  girls_age_groups?: string[];
  boys_flight_count?: number;
  girls_flight_count?: number;
  boys_points?: number;
  girls_points?: number;
  combined_points?: number;
  percent_in_region_teams?: string;
  percent_in_state_teams?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gender   = searchParams.get('gender') || 'combined';
  const state    = searchParams.get('state')  || 'national';
  const age      = searchParams.get('age')    || 'all';
  const page     = parseInt(searchParams.get('page') || '1');
  const pageSize = 25;

  try {
    // Use in-memory cache to avoid fetching 83 pages on every request
    if (!cachedEvents || Date.now() - cacheTimestamp > CACHE_TTL) {
      const fetchOpts = { headers: FETCH_HEADERS, next: { revalidate: 86400 } };
      const firstRes = await fetch(`${GOTSPORT_URL}?page=1`, fetchOpts);
      if (!firstRes.ok) throw new Error(`GotSport returned ${firstRes.status}`);
      const firstJson = await firstRes.json();
      const { total_pages } = firstJson.pagination || { total_pages: 1 };

      const allPages = [firstJson];
      const remainingPages = Array.from({ length: Math.min(total_pages - 1, 82) }, (_, i) => i + 2);
      for (let i = 0; i < remainingPages.length; i += 10) {
        const batch = remainingPages.slice(i, i + 10);
        const results = await Promise.all(
          batch.map(p => fetch(`${GOTSPORT_URL}?page=${p}`, fetchOpts).then(r => r.ok ? r.json() : ({})).catch(() => ({})))
        );
        allPages.push(...results);
      }

      cachedEvents = allPages.flatMap(p => p.event_ranking_data || []);
      cacheTimestamp = Date.now();
    }

    let events: GotSportEvent[] = [...cachedEvents];

    if (state !== 'national') {
      events = events.filter(e => e.state?.toUpperCase() === state.toUpperCase());
    }

    if (age !== 'all') {
      events = events.filter(e => {
        if (gender === 'boys')  return e.boys_age_groups?.includes(age);
        if (gender === 'girls') return e.girls_age_groups?.includes(age);
        return e.boys_age_groups?.includes(age) || e.girls_age_groups?.includes(age);
      });
    }

    if (gender === 'boys') {
      events = events.filter(e => (e.boys_team_count || 0) > 0);
    } else if (gender === 'girls') {
      events = events.filter(e => (e.girls_team_count || 0) > 0);
    }

    events.sort((a, b) => {
      const rankA = gender === 'boys' ? a.boys_rank : gender === 'girls' ? a.girls_rank : a.combined_rank;
      const rankB = gender === 'boys' ? b.boys_rank : gender === 'girls' ? b.girls_rank : b.combined_rank;
      return (rankA || 9999) - (rankB || 9999);
    });

    const total = events.length;
    const totalPages = Math.ceil(total / pageSize);
    const paginated = events.slice((page - 1) * pageSize, page * pageSize);

    const shaped = paginated.map(e => {
      const rankCategory = gender === 'girls'
        ? e.event?.girls_ranking_category
        : gender === 'boys'
        ? e.event?.boys_ranking_category
        : e.event?.girls_ranking_category || e.event?.boys_ranking_category;

      return {
        id: e.id,
        eventId: e.event?.id,
        name: e.event?.name || 'Unknown Event',
        city: e.event?.city || '',
        state: e.state || '',
        region: REGION_NAMES[e.region || ''] || '',
        startDate: e.event?.start_date_formatted?.medium || '',
        endDate: e.event?.end_date_formatted?.medium || '',
        startDateDashed: e.event?.start_date_formatted?.dashed || '',
        tournament: e.event?.tournament || false,
        league: e.event?.league || false,
        playoffs: e.playoffs || false,
        imageUrl: e.event?.image ? `https://system.gotsport.com${e.event.image}` : null,
        rankCategory: rankCategory?.title || null,
        rankCategoryLevel: rankCategory?.event_level || 0,
        boysRank: e.boys_rank,
        girlsRank: e.girls_rank,
        combinedRank: e.combined_rank,
        boysTeamCount: e.boys_team_count || 0,
        girlsTeamCount: e.girls_team_count || 0,
        combinedTeamCount: e.combined_team_count || 0,
        boysAgeGroups: e.boys_age_groups || [],
        girlsAgeGroups: e.girls_age_groups || [],
        boysFlightCount: e.boys_flight_count || 0,
        girlsFlightCount: e.girls_flight_count || 0,
        boysPoints: e.boys_points || 0,
        girlsPoints: e.girls_points || 0,
        combinedPoints: e.combined_points || 0,
        percentInRegion: e.percent_in_region_teams || '0%',
        percentInState: e.percent_in_state_teams || '0%',
      };
    });

    return NextResponse.json({
      events: shaped,
      meta: { gender, state, age, page, pageSize, total, totalPages, source: 'GotSport' },
    });

  } catch (error: unknown) {
    console.error('Event rankings error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch events', message }, { status: 500 });
  }
}
