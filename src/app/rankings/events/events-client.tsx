'use client';

import { useState, useEffect, useCallback } from 'react';

const US_STATES = [
  { code: 'national', name: 'All States' },
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

const AGE_GROUPS = ['all','10','11','12','13','14','15','16','17','18','19'];

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Premier Elite Tournament': { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  'Elite Tournament':         { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  'Classic Tournament':       { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  'Regional Tournament':      { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
};

const DEFAULT_TIER = { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };

interface EventData {
  id: number;
  name: string;
  city: string;
  state: string;
  region: string;
  startDate: string;
  endDate: string;
  tournament: boolean;
  league: boolean;
  playoffs: boolean;
  imageUrl: string | null;
  rankCategory: string | null;
  boysRank: number;
  girlsRank: number;
  combinedRank: number;
  boysTeamCount: number;
  girlsTeamCount: number;
  combinedTeamCount: number;
  boysAgeGroups: string[];
  girlsAgeGroups: string[];
  boysFlightCount: number;
  girlsFlightCount: number;
  boysPoints: number;
  girlsPoints: number;
  combinedPoints: number;
  percentInRegion: string;
}

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return null;
  const colors = TIER_COLORS[tier] || DEFAULT_TIER;
  const shortTier = tier.replace(' Tournament', '');
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
      background: colors.bg, color: colors.text,
      border: `1px solid ${colors.border}`,
      whiteSpace: 'nowrap',
    }}>
      {shortTier}
    </span>
  );
}

function RankBadge({ rank }: { rank: number | undefined }) {
  if (!rank) return null;
  const base: React.CSSProperties = { width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 };
  if (rank === 1) return <div style={{ ...base, background: 'linear-gradient(135deg,#FFD700,#FFA500)', color: '#7B3F00', boxShadow: '0 2px 8px rgba(255,165,0,0.4)' }}>{rank}</div>;
  if (rank === 2) return <div style={{ ...base, background: 'linear-gradient(135deg,#D1D5DB,#9CA3AF)', color: '#374151' }}>{rank}</div>;
  if (rank === 3) return <div style={{ ...base, background: 'linear-gradient(135deg,#D97706,#B45309)', color: '#FFF' }}>{rank}</div>;
  return <div style={{ ...base, background: rank <= 10 ? '#EFF6FF' : '#F8FAFC', border: `2px solid ${rank <= 10 ? '#BFDBFE' : '#E2E8F0'}`, color: rank <= 10 ? '#1D4ED8' : '#94A3B8', fontSize: 12 }}>{rank}</div>;
}

function EventCard({ event, gender, index }: { event: EventData; gender: string; index: number }) {
  const [hovered, setHovered] = useState(false);
  const rank = gender === 'boys' ? event.boysRank : gender === 'girls' ? event.girlsRank : event.combinedRank;
  const teamCount = gender === 'boys' ? event.boysTeamCount : gender === 'girls' ? event.girlsTeamCount : event.combinedTeamCount;
  const ageGroups = gender === 'boys' ? event.boysAgeGroups : gender === 'girls' ? event.girlsAgeGroups : [...new Set([...event.boysAgeGroups, ...event.girlsAgeGroups])].sort((a,b)=>Number(a)-Number(b));
  const points = gender === 'boys' ? event.boysPoints : gender === 'girls' ? event.girlsPoints : event.combinedPoints;
  const flightCount = gender === 'boys' ? event.boysFlightCount : gender === 'girls' ? event.girlsFlightCount : event.boysFlightCount + event.girlsFlightCount;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#F8FBFF' : 'white',
        border: `1px solid ${hovered ? '#BFDBFE' : '#E2E8F0'}`,
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        transition: 'all 0.15s ease',
        boxShadow: hovered ? '0 4px 16px rgba(59,130,246,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
        animation: `fadeIn 0.25s ease ${Math.min(index * 0.04, 0.6)}s both`,
        cursor: 'default',
      }}
    >
      <RankBadge rank={rank} />

      <div style={{ flexShrink: 0, width: 44, height: 44 }}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.name}
            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'contain', background: '#F8FAFC' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: 44, height: 44, borderRadius: 8,
            background: 'linear-gradient(135deg,#0E3272,#1A5DC8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>&#9917;</div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
            color: '#0F172A', lineHeight: 1.3, flex: 1, minWidth: 0,
          }}>
            {event.name}
          </div>
          <TierBadge tier={event.rankCategory} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
            &#128205; {[event.city, event.state].filter(Boolean).join(', ')}
          </span>
          {event.startDate && (
            <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
              &#128197; {event.startDate}{event.endDate && event.endDate !== event.startDate ? ` \u2013 ${event.endDate}` : ''}
            </span>
          )}
          {event.playoffs && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#10B981',
              background: '#ECFDF5', padding: '2px 7px', borderRadius: 4,
              border: '1px solid #A7F3D0',
            }}>&#10003; PLAYOFFS</span>
          )}
          {event.league && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#6366F1',
              background: '#EEF2FF', padding: '2px 7px', borderRadius: 4,
            }}>LEAGUE</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {teamCount > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{teamCount}</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>Teams</div>
            </div>
          )}
          {flightCount > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{flightCount}</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>Flights</div>
            </div>
          )}
          {points > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{points.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>Points</div>
            </div>
          )}
          {event.percentInRegion && event.percentInRegion !== '0%' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{event.percentInRegion}</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>In Region</div>
            </div>
          )}
        </div>

        {ageGroups.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
            {ageGroups.map(ag => (
              <span key={ag} style={{
                padding: '2px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0',
              }}>U{ag}</span>
            ))}
          </div>
        )}
      </div>

      {rank && (
        <div style={{
          flexShrink: 0, textAlign: 'right',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2,
        }}>
          <div style={{ fontSize: 10, color: '#94A3B8', fontFamily: "'DM Sans', sans-serif" }}>Rank</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 800, color: rank <= 10 ? '#1D4ED8' : '#334155', lineHeight: 1 }}>
            #{rank}
          </div>
          {event.region && (
            <div style={{ fontSize: 10, color: '#94A3B8' }}>{event.region}</div>
          )}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  const s: React.CSSProperties = { background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 6 };
  return (
    <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14 }}>
      <div style={{ ...s, width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ ...s, width: 44, height: 44, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ ...s, height: 16, width: '70%' }} />
        <div style={{ ...s, height: 12, width: '45%' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div style={{ ...s, height: 28, width: 50 }} />
          <div style={{ ...s, height: 28, width: 50 }} />
          <div style={{ ...s, height: 28, width: 60 }} />
        </div>
      </div>
    </div>
  );
}

export default function EventRankingsPage() {
  const [gender, setGender] = useState('combined');
  const [state, setState] = useState('national');
  const [age, setAge] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ events: EventData[]; meta: { total: number; page: number; totalPages: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ gender, state, age, page: String(page) });
      const res = await fetch(`/api/events-rankings?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.message || json.error);
      setData(json);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [gender, state, age, page]);

  useEffect(() => { setPage(1); }, [gender, state, age]);
  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const stateName = US_STATES.find(s => s.code === state)?.name || 'All States';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;600&family=Fraunces:wght@700;900&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .events-root { min-height: 100vh; background: #F1F5F9; font-family: 'DM Sans', sans-serif; }

        .hero {
          background: linear-gradient(140deg, #071529 0%, #0E3272 50%, #1565C0 100%);
          padding: 52px 24px 44px; position: relative; overflow: hidden;
        }
        .hero::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 70% 40%, rgba(99,179,237,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-inner { max-width: 980px; margin: 0 auto; position: relative; z-index: 1; }
        .hero-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          padding: 4px 13px; border-radius: 20px; font-size: 10px; font-weight: 700;
          color: rgba(255,255,255,0.8); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 18px;
        }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #34D399; animation: pulse 1.8s ease-in-out infinite; }
        .hero-title { font-family: 'Fraunces', serif; font-weight: 900; font-size: clamp(28px,5vw,48px); color: white; line-height: 1.08; margin-bottom: 8px; }
        .hero-title span { color: #60A5FA; }
        .hero-sub { font-size: 14px; color: rgba(255,255,255,0.55); }

        .controls-bar { background: white; border-bottom: 1px solid #E2E8F0; padding: 0 24px; position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
        .controls-inner { max-width: 980px; margin: 0 auto; display: flex; align-items: center; gap: 10px; padding: 11px 0; flex-wrap: wrap; }

        .seg { display: flex; background: #F1F5F9; border-radius: 8px; padding: 3px; gap: 2px; }
        .seg-btn { padding: 6px 14px; border-radius: 6px; border: none; font-size: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.14s; background: transparent; color: #64748B; white-space: nowrap; }
        .seg-btn.active { background: white; color: #0B2545; box-shadow: 0 1px 4px rgba(0,0,0,0.13); }

        .age-scroll { display: flex; gap: 5px; overflow-x: auto; scrollbar-width: none; flex: 1; min-width: 0; }
        .age-scroll::-webkit-scrollbar { display: none; }
        .age-pill { padding: 5px 11px; border-radius: 20px; border: 1.5px solid #E2E8F0; background: white; font-size: 11px; font-weight: 700; font-family: 'DM Sans', sans-serif; color: #64748B; cursor: pointer; white-space: nowrap; transition: all 0.13s; }
        .age-pill.active { background: #0B2545; border-color: #0B2545; color: white; }
        .age-pill:hover:not(.active) { border-color: #93C5FD; color: #1D4ED8; }

        .state-select { padding: 7px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #334155; background: white; cursor: pointer; outline: none; transition: border-color 0.13s; max-width: 165px; }
        .state-select:focus { border-color: #3B82F6; }

        .main { max-width: 980px; margin: 0 auto; padding: 24px; }
        .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }

        .events-grid { display: flex; flex-direction: column; gap: 10px; }

        .pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; flex-wrap: wrap; }
        .page-btn { padding: 7px 14px; border-radius: 8px; border: 1.5px solid #E2E8F0; background: white; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; color: #334155; cursor: pointer; transition: all 0.13s; }
        .page-btn:hover:not(:disabled) { border-color: #93C5FD; color: #1D4ED8; }
        .page-btn.active { background: #0B2545; border-color: #0B2545; color: white; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .source-row { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; flex-wrap: wrap; gap: 8px; }
        .source-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: #64748B; background: white; border: 1px solid #E2E8F0; padding: 5px 12px; border-radius: 20px; }
        .gotsport-link { font-size: 12px; color: #3B82F6; text-decoration: none; font-weight: 600; }
        .gotsport-link:hover { text-decoration: underline; }

        .error-box { padding: 48px; text-align: center; background: white; border-radius: 12px; border: 1px solid #E2E8F0; }
        .retry-btn { margin-top: 12px; padding: 8px 22px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; }
        .empty-box { padding: 60px 24px; text-align: center; background: white; border-radius: 12px; border: 1px solid #E2E8F0; }
      `}</style>

      <div className="events-root">
        {/* Hero */}
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-pill"><span className="live-dot" />Live Data &middot; GotSport</div>
            <h1 className="hero-title">Tournament<br /><span>Event Rankings</span></h1>
            <p className="hero-sub">Top-ranked youth soccer tournaments across the US &mdash; updated weekly</p>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-bar">
          <div className="controls-inner">
            <div className="seg">
              {([['combined','Combined'],['boys','Boys'],['girls','Girls']] as const).map(([val,label]) => (
                <button key={val} className={`seg-btn ${gender===val?'active':''}`} onClick={()=>setGender(val)}>{label}</button>
              ))}
            </div>

            <div className="age-scroll">
              {AGE_GROUPS.map(ag => (
                <button key={ag} className={`age-pill ${age===ag?'active':''}`} onClick={()=>setAge(ag)}>
                  {ag==='all'?'All Ages':`U${ag}`}
                </button>
              ))}
            </div>

            <select className="state-select" value={state} onChange={e=>setState(e.target.value)}>
              {US_STATES.map(s=><option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Main */}
        <div className="main">
          <div className="results-header">
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 700, color: '#0F172A' }}>
              {gender === 'combined' ? 'All' : gender === 'boys' ? 'Boys' : 'Girls'} Events
              {age !== 'all' && ` \u00b7 U${age}`}
              {state !== 'national' && ` \u00b7 ${stateName}`}
            </div>
            {!loading && data && (
              <div style={{ fontSize: 12, color: '#94A3B8' }}>
                {data.meta.total.toLocaleString()} events &middot; page {data.meta.page} of {data.meta.totalPages}
              </div>
            )}
          </div>

          <div className="events-grid">
            {loading && Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)}

            {!loading && error && (
              <div className="error-box">
                <div style={{fontSize:32,marginBottom:8}}>&#9888;&#65039;</div>
                <div style={{fontWeight:600,color:'#EF4444',marginBottom:4}}>Could not load events</div>
                <div style={{fontSize:13,color:'#94A3B8',marginBottom:12}}>{error}</div>
                <button className="retry-btn" onClick={fetchEvents}>Try Again</button>
              </div>
            )}

            {!loading && !error && data?.events?.length === 0 && (
              <div className="empty-box">
                <div style={{fontSize:36,marginBottom:10}}>&#128269;</div>
                <div style={{fontWeight:700,color:'#334155',marginBottom:4}}>No events found</div>
                <div style={{fontSize:13,color:'#94A3B8'}}>Try adjusting the filters above</div>
              </div>
            )}

            {!loading && !error && data?.events?.map((event, i) => (
              <EventCard key={event.id} event={event} gender={gender} index={i} />
            ))}
          </div>

          {!loading && data && data.meta.totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={()=>setPage(p=>p-1)} disabled={page<=1}>&larr; Prev</button>
              {Array.from({length: Math.min(data.meta.totalPages, 7)}, (_, i) => {
                let p;
                if (data.meta.totalPages <= 7) p = i + 1;
                else if (page <= 4) p = i + 1;
                else if (page >= data.meta.totalPages - 3) p = data.meta.totalPages - 6 + i;
                else p = page - 3 + i;
                return (
                  <button key={p} className={`page-btn ${p===page?'active':''}`} onClick={()=>setPage(p)}>{p}</button>
                );
              })}
              <button className="page-btn" onClick={()=>setPage(p=>p+1)} disabled={page>=data.meta.totalPages}>Next &rarr;</button>
            </div>
          )}

          {!loading && data && (
            <div className="source-row">
              <div className="source-badge">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="#10B981"><circle cx="6" cy="6" r="5"/><path d="M4 6l1.5 1.5L8 4.5" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>
                Source: GotSport Rankings
              </div>
              <a href="https://rankings.gotsport.com" target="_blank" rel="noopener noreferrer" className="gotsport-link">
                Full rankings on GotSport &#8599;
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
