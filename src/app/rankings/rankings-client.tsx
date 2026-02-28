'use client';

import { useState, useEffect, useCallback } from 'react';

const US_STATES = [
  { code: 'national', name: 'National' },
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

const AGE_GROUPS = ['10','11','12','13','14','15','16','17','18','19'];

const REGION_COLORS: Record<string, string> = {
  'Northeast': '#6366F1',
  'Midwest':   '#8B5CF6',
  'South':     '#F59E0B',
  'West':      '#3B82F6',
};

interface RankingTeam {
  rank: number;
  nationalRank?: number;
  regionalRank?: number;
  stateRank?: number;
  name: string;
  club: string;
  state: string;
  region: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  bonusPoints: number;
  winPercent: number;
  goalRatio: number;
  totalGoals: number;
  goalsAgainst: number;
  matches: number;
  logoUrl: string | null;
  teamId: string;
  rankingDate: string;
}

interface RankingsData {
  teams: RankingTeam[];
  meta: {
    gender: string;
    age: string;
    state: string;
    total: number;
    lastUpdated: string;
    source: string;
  };
}

function RankBadge({ rank }: { rank: number }) {
  const base: React.CSSProperties = {
    width: 38, height: 38, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 14, flexShrink: 0,
  };
  if (rank === 1) return <div style={{ ...base, background: 'linear-gradient(135deg,#FFD700,#FFA500)', color: '#7B3F00', boxShadow: '0 2px 10px rgba(255,165,0,0.45)' }}>{rank}</div>;
  if (rank === 2) return <div style={{ ...base, background: 'linear-gradient(135deg,#D1D5DB,#9CA3AF)', color: '#374151' }}>{rank}</div>;
  if (rank === 3) return <div style={{ ...base, background: 'linear-gradient(135deg,#D97706,#B45309)', color: '#FFF' }}>{rank}</div>;
  return (
    <div style={{ ...base, background: rank <= 10 ? '#EFF6FF' : '#F8FAFC', border: `2px solid ${rank <= 10 ? '#BFDBFE' : '#E2E8F0'}`, color: rank <= 10 ? '#1D4ED8' : '#94A3B8', fontSize: 13 }}>
      {rank}
    </div>
  );
}

function TeamLogo({ logoUrl, name }: { logoUrl: string | null; name: string }) {
  const [err, setErr] = useState(false);
  if (!logoUrl || err) {
    return (
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'linear-gradient(135deg,#1E3A5F,#2563EB)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0,
      }}>
        {name?.charAt(0) || '?'}
      </div>
    );
  }
  return (
    <img src={logoUrl} alt={name} onError={() => setErr(true)}
      style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', flexShrink: 0, background: '#F8FAFC' }} />
  );
}

function TeamRow({ team, index, state }: { team: RankingTeam; index: number; state: string }) {
  const [hovered, setHovered] = useState(false);
  const regionColor = REGION_COLORS[team.region] || '#6B7280';
  const winPct = Math.round(team.winPercent * 100);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '13px 20px',
        background: hovered ? '#F0F7FF' : (index % 2 === 0 ? '#FFFFFF' : '#FAFBFC'),
        borderBottom: '1px solid #EEF2F7',
        transition: 'background 0.12s ease',
        animation: `fadeIn 0.25s ease ${Math.min(index * 0.03, 0.5)}s both`,
      }}
    >
      <RankBadge rank={team.rank} />
      <TeamLogo logoUrl={team.logoUrl} name={team.name} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#0F172A',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {team.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>{team.club}</span>
          {team.state && (
            <span style={{ padding: '1px 5px', background: '#F1F5F9', borderRadius: 4, fontSize: 10, fontWeight: 700, color: '#64748B' }}>
              {team.state}
            </span>
          )}
          {state !== 'national' && team.nationalRank && (
            <span style={{ padding: '1px 6px', background: '#EFF6FF', borderRadius: 4, fontSize: 10, fontWeight: 600, color: '#3B82F6' }}>
              #{team.nationalRank} Natl
            </span>
          )}
        </div>
      </div>

      {/* Region */}
      <div className="hide-sm" style={{
        padding: '3px 10px', borderRadius: 20,
        background: `${regionColor}15`, color: regionColor,
        fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
      }}>
        {team.region}
      </div>

      {/* Record */}
      <div style={{ textAlign: 'center', minWidth: 68 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: '#334155' }}>
          {team.wins}-{team.losses}-{team.draws}
        </div>
        <div style={{ fontSize: 10, color: '#CBD5E1' }}>W-L-D</div>
      </div>

      {/* Win % */}
      <div className="hide-sm" style={{ minWidth: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#64748B', fontWeight: 600 }}>{winPct}%</span>
          <span style={{ fontSize: 10, color: '#CBD5E1' }}>win</span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: '#E2E8F0', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3, width: `${winPct}%`,
            background: winPct >= 75 ? '#10B981' : winPct >= 55 ? '#3B82F6' : '#F59E0B',
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>

      {/* Goal Ratio */}
      <div className="hide-md" style={{ textAlign: 'center', minWidth: 52 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: '#334155' }}>
          {team.goalRatio.toFixed(2)}
        </div>
        <div style={{ fontSize: 10, color: '#CBD5E1' }}>G/G</div>
      </div>

      {/* Points */}
      <div style={{ textAlign: 'right', minWidth: 70 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
          {team.points.toLocaleString()}
        </div>
        <div style={{ fontSize: 10, color: '#CBD5E1' }}>pts</div>
      </div>
    </div>
  );
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: '1px solid #EEF2F7' }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', flexShrink: 0 }} />
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 13, width: `${50 + (index * 7) % 30}%`, borderRadius: 4, background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        <div style={{ height: 10, width: '35%', borderRadius: 4, background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      </div>
      <div style={{ width: 60, height: 13, borderRadius: 4, background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ width: 55, height: 20, borderRadius: 4, background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
    </div>
  );
}

export function RankingsClient() {
  const [gender, setGender] = useState('m');
  const [age, setAge] = useState('14');
  const [state, setState] = useState('national');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ gender, age, state });
      const res = await fetch(`/api/rankings?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.message || json.error);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [gender, age, state]);

  useEffect(() => { fetchRankings(); }, [fetchRankings]);

  const stateName = US_STATES.find(s => s.code === state)?.name || 'National';
  const genderLabel = gender === 'm' ? 'Boys' : 'Girls';

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .rankings-root { min-height: 100vh; background: #F1F5F9; font-family: 'DM Sans', sans-serif; }

        .rankings-hero {
          background: linear-gradient(140deg, #071529 0%, #0E3272 55%, #1A5DC8 100%);
          padding: 52px 24px 44px; position: relative; overflow: hidden;
        }
        .rankings-hero::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 80% 50%, rgba(99,179,237,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-inner { max-width: 980px; margin: 0 auto; position: relative; z-index: 1; }
        .hero-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          padding: 4px 13px; border-radius: 20px;
          font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.8);
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 18px;
        }
        .live-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #34D399;
          animation: pulse 1.8s ease-in-out infinite;
        }
        .hero-title {
          font-family: var(--font-display, 'Outfit', sans-serif); font-weight: 900;
          font-size: clamp(30px, 5vw, 50px); color: white; line-height: 1.08; margin-bottom: 8px;
        }
        .hero-title span { color: #60A5FA; }
        .hero-sub { font-size: 14px; color: rgba(255,255,255,0.55); }

        .controls-bar {
          background: white; border-bottom: 1px solid #E2E8F0;
          padding: 0 24px; position: sticky; top: 64px; z-index: 40;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }
        .controls-inner {
          max-width: 980px; margin: 0 auto;
          display: flex; align-items: center; gap: 12px;
          padding: 11px 0; flex-wrap: wrap;
        }

        .gender-toggle { display: flex; background: #F1F5F9; border-radius: 8px; padding: 3px; }
        .gender-btn {
          padding: 6px 18px; border-radius: 6px; border: none;
          font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.14s ease;
          background: transparent; color: #64748B;
        }
        .gender-btn.active {
          background: white; color: #0B2545;
          box-shadow: 0 1px 4px rgba(0,0,0,0.13);
        }

        .age-scroll { display: none; gap: 5px; overflow-x: auto; scrollbar-width: none; flex: 1; min-width: 0; }
        .age-scroll::-webkit-scrollbar { display: none; }
        .age-btn {
          padding: 5px 13px; border-radius: 20px;
          border: 1.5px solid #E2E8F0; background: white;
          font-size: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          color: #64748B; cursor: pointer; white-space: nowrap; transition: all 0.13s ease;
        }
        .age-btn.active { background: #0B2545; border-color: #0B2545; color: white; }
        .age-btn:hover:not(.active) { border-color: #93C5FD; color: #1D4ED8; }

        .age-mobile-select {
          padding: 7px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600;
          color: #334155; background: white; cursor: pointer; outline: none;
          transition: border-color 0.13s;
        }
        .age-mobile-select:focus { border-color: #3B82F6; }

        .rk-state-select {
          padding: 7px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500;
          color: #334155; background: white; cursor: pointer; outline: none;
          transition: border-color 0.13s; max-width: 165px;
        }
        .rk-state-select:focus { border-color: #3B82F6; }

        .rk-search {
          padding: 7px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500;
          color: #334155; background: white; outline: none;
          transition: border-color 0.13s; min-width: 160px; max-width: 220px;
        }
        .rk-search:focus { border-color: #3B82F6; }
        .rk-search::placeholder { color: #94A3B8; }

        .rk-main { max-width: 980px; margin: 0 auto; padding: 24px; }

        .results-header {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-bottom: 14px; flex-wrap: wrap; gap: 8px;
        }

        .table-card {
          background: white; border-radius: 12px;
          border: 1px solid #E2E8F0; overflow: hidden;
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
        }
        .table-head {
          display: flex; align-items: center; gap: 14px;
          padding: 9px 20px; background: #F8FAFC;
          border-bottom: 2px solid #E2E8F0;
        }
        .th {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #94A3B8;
        }

        .source-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 14px; flex-wrap: wrap; gap: 8px;
        }
        .source-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; color: #64748B;
          background: white; border: 1px solid #E2E8F0;
          padding: 5px 12px; border-radius: 20px;
        }
        .gotsport-link {
          font-size: 12px; color: #3B82F6; text-decoration: none;
          font-weight: 600; display: inline-flex; align-items: center; gap: 4px;
        }
        .gotsport-link:hover { text-decoration: underline; }

        .error-box { padding: 40px; text-align: center; }
        .retry-btn {
          margin-top: 12px; padding: 8px 22px;
          background: #3B82F6; color: white; border: none;
          border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 13px;
        }
        .empty-box { padding: 52px 24px; text-align: center; }

        .hide-sm { display: none !important; }
        .hide-md { display: none !important; }
        @media (min-width: 600px) {
          .hide-sm { display: flex !important; }
          .age-scroll { display: flex !important; }
          .age-mobile-select { display: none !important; }
        }
        @media (min-width: 800px) { .hide-md { display: block !important; } }
      `}</style>

      <div className="rankings-root">

        {/* Hero */}
        <div className="rankings-hero">
          <div className="hero-inner">
            <div className="hero-pill">
              <span className="live-dot" />
              Live Data
            </div>
            <h1 className="hero-title">
              Youth Soccer<br /><span>Team Rankings</span>
            </h1>
            <p className="hero-sub">National &amp; state rankings across all age groups &mdash; updated weekly</p>
          </div>
        </div>

        {/* Sticky Controls */}
        <div className="controls-bar">
          <div className="controls-inner">
            <div className="gender-toggle">
              {([['m','Boys'],['f','Girls']] as const).map(([val, label]) => (
                <button key={val} className={`gender-btn ${gender === val ? 'active' : ''}`} onClick={() => setGender(val)}>
                  {label}
                </button>
              ))}
            </div>
            <select className="age-mobile-select" value={age} onChange={e => setAge(e.target.value)}>
              {AGE_GROUPS.map(ag => <option key={ag} value={ag}>U{ag}</option>)}
            </select>
            <div className="age-scroll">
              {AGE_GROUPS.map(ag => (
                <button key={ag} className={`age-btn ${age === ag ? 'active' : ''}`} onClick={() => setAge(ag)}>
                  U{ag}
                </button>
              ))}
            </div>
            <select className="rk-state-select" value={state} onChange={e => setState(e.target.value)}>
              {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search team or club..."
              className="rk-search"
            />
          </div>
        </div>

        {/* Content */}
        <div className="rk-main">
          <div className="results-header">
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 700, color: '#0F172A' }}>
              {genderLabel} U{age} &middot; {stateName}
            </div>
            {!loading && data && (
              <div style={{ fontSize: 12, color: '#94A3B8' }}>
                {data.meta.total} team{data.meta.total !== 1 ? 's' : ''} &middot; ranked {data.meta.lastUpdated}
              </div>
            )}
          </div>

          <div className="table-card">
            {/* Column headers */}
            <div className="table-head">
              <div className="th" style={{ width: 38, flexShrink: 0 }}>#</div>
              <div className="th" style={{ width: 36, flexShrink: 0 }}></div>
              <div className="th" style={{ flex: 1 }}>Team</div>
              <div className="th hide-sm" style={{ minWidth: 80 }}>Region</div>
              <div className="th" style={{ minWidth: 68 }}>Record</div>
              <div className="th hide-sm" style={{ minWidth: 80 }}>Win%</div>
              <div className="th hide-md" style={{ minWidth: 52 }}>G/G</div>
              <div className="th" style={{ minWidth: 70, textAlign: 'right' }}>Points</div>
            </div>

            {/* Loading */}
            {loading && Array.from({ length: 12 }).map((_, i) => <SkeletonRow key={i} index={i} />)}

            {/* Error */}
            {!loading && error && (
              <div className="error-box">
                <div style={{ fontSize: 32, marginBottom: 8 }}>&#9888;&#65039;</div>
                <div style={{ fontWeight: 600, color: '#EF4444', marginBottom: 4 }}>Could not load rankings</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12 }}>{error}</div>
                <button className="retry-btn" onClick={fetchRankings}>Try Again</button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && data?.teams?.length === 0 && (
              <div className="empty-box">
                <div style={{ fontSize: 36, marginBottom: 10 }}>&#128269;</div>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>No teams found</div>
                <div style={{ fontSize: 13, color: '#94A3B8' }}>Try a different state, age group, or gender</div>
              </div>
            )}

            {/* Rows */}
            {!loading && !error && data?.teams
              ?.filter(team => {
                if (!search) return true;
                const q = search.toLowerCase();
                return (team.name || '').toLowerCase().includes(q) || (team.club || '').toLowerCase().includes(q);
              })
              .map((team, i) => (
                <TeamRow key={team.teamId || i} team={team} index={i} state={state} />
              ))}
          </div>

          {/* Source footer */}
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
