import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log("Creating tables...");
  const schema = readFileSync(join(__dirname, "../src/lib/schema.sql"), "utf-8");
  // Execute each statement separately using sql.query for raw strings
  const statements = schema.split(";").map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log("Tables created.");

  // ── Clubs ──────────────────────────────────────────────────
  console.log("Seeding clubs...");
  const clubs = [
    { id: "c1", slug: "charlotte-fc-youth-academy", name: "Charlotte FC Youth Academy", city: "Charlotte", state: "NC", level: "MLS Next", age_groups: "U10–U19", gender: "Boys & Girls", team_count: 24, description: "Official MLS Next academy developing elite youth talent in the Charlotte metro area. Professional coaching staff, top-tier facilities, and a clear pathway to the first team.", website: "charlottefc.com", email: "youth@charlottefc.com", featured: true },
    { id: "c2", slug: "nc-fusion", name: "NC Fusion", city: "Greensboro", state: "NC", level: "ECNL", age_groups: "U8–U19", gender: "Boys & Girls", team_count: 32, description: "Premier competitive club offering ECNL and national league pathways. Strong college placement track record with 50+ D1 commits in the last 3 years.", website: "ncfusion.org", email: "info@ncfusion.org", featured: true },
    { id: "c3", slug: "cesa", name: "CESA", city: "Charlotte", state: "NC", level: "ECNL / GA", age_groups: "U8–U19", gender: "Boys & Girls", team_count: 38, description: "Charlotte's premier competitive soccer club with national league affiliations across ECNL and Girls Academy platforms.", website: "cesasoccer.com", email: "info@cesasoccer.com", featured: true },
    { id: "c4", slug: "south-charlotte-soccer", name: "South Charlotte Soccer Association", city: "Charlotte", state: "NC", level: "Recreational", age_groups: "U4–U18", gender: "Boys & Girls", team_count: 45, description: "The largest recreational soccer program in south Charlotte. Focused on fun, development, and community for players of all skill levels.", website: "southcharlottesoccer.com", email: null, featured: false },
    { id: "c5", slug: "nc-fc-youth", name: "North Carolina FC Youth", city: "Raleigh", state: "NC", level: "ECNL / MLS Next", age_groups: "U9–U19", gender: "Boys & Girls", team_count: 28, description: "Elite development pathway in the Triangle area backed by professional club North Carolina FC. Dual platform participation in ECNL and MLS Next.", website: "ncfcyouth.com", email: null, featured: true },
    { id: "c6", slug: "carolina-rapids", name: "Carolina Rapids", city: "Rock Hill", state: "SC", level: "ECNL Regional", age_groups: "U8–U19", gender: "Boys & Girls", team_count: 22, description: "Competitive club serving the greater Rock Hill and Fort Mill corridor with strong regional league participation.", website: "carolinarapids.com", email: null, featured: false },
  ];
  for (const c of clubs) {
    await sql`INSERT INTO clubs (id, slug, name, city, state, level, age_groups, gender, team_count, description, website, email, featured, status) VALUES (${c.id}, ${c.slug}, ${c.name}, ${c.city}, ${c.state}, ${c.level}, ${c.age_groups}, ${c.gender}, ${c.team_count}, ${c.description}, ${c.website}, ${c.email}, ${c.featured}, 'approved') ON CONFLICT (id) DO NOTHING`;
  }

  // ── Teams ──────────────────────────────────────────────────
  console.log("Seeding teams...");
  const teams = [
    { id: "t1", slug: "charlotte-fc-2010-boys", name: "Charlotte FC Academy 2010 Boys", club_id: "c1", club_name: "Charlotte FC Youth Academy", city: "Charlotte", state: "NC", level: "MLS Next", age_group: "2010", gender: "Boys", coach: "Marcus Williams", looking_for_players: true, positions_needed: "GK, CB", season: "2025-26", description: "Top-tier MLS Next team competing at the national level. Looking for committed players ready for a professional development environment.", featured: true },
    { id: "t2", slug: "nc-fusion-ecnl-2012-girls", name: "NC Fusion ECNL 2012 Girls", club_id: "c2", club_name: "NC Fusion", city: "Greensboro", state: "NC", level: "ECNL", age_group: "2012", gender: "Girls", coach: "Sarah Chen", looking_for_players: true, positions_needed: "ST, CM", season: "2025-26", description: null, featured: true },
    { id: "t3", slug: "cesa-2013-boys-blue", name: "CESA 2013 Boys Blue", club_id: "c3", club_name: "CESA", city: "Charlotte", state: "NC", level: "ECNL Regional", age_group: "2013", gender: "Boys", coach: "David Park", looking_for_players: false, positions_needed: null, season: "2025-26", description: null, featured: false },
    { id: "t4", slug: "ncfc-youth-ecnl-2012-boys", name: "NCFC Youth ECNL 2012 Boys", club_id: "c5", club_name: "North Carolina FC Youth", city: "Raleigh", state: "NC", level: "ECNL", age_group: "2012", gender: "Boys", coach: "James Morton", looking_for_players: true, positions_needed: "RW, LB", season: "2025-26", description: null, featured: true },
    { id: "t5", slug: "carolina-rapids-2014-girls", name: "Carolina Rapids 2014 Girls", club_id: "c6", club_name: "Carolina Rapids", city: "Rock Hill", state: "SC", level: "ECNL Regional", age_group: "2014", gender: "Girls", coach: "Maria Santos", looking_for_players: true, positions_needed: "All positions", season: "2025-26", description: null, featured: false },
    { id: "t6", slug: "south-charlotte-u10-rec", name: "South Charlotte U10 Rec Gold", club_id: "c4", club_name: "South Charlotte Soccer Association", city: "Charlotte", state: "NC", level: "Recreational", age_group: "2015", gender: "Boys", coach: "Tom Bradley", looking_for_players: true, positions_needed: "All positions", season: "Spring 2026", description: null, featured: false },
  ];
  for (const t of teams) {
    await sql`INSERT INTO teams (id, slug, name, club_id, club_name, city, state, level, age_group, gender, coach, looking_for_players, positions_needed, season, description, featured, status) VALUES (${t.id}, ${t.slug}, ${t.name}, ${t.club_id}, ${t.club_name}, ${t.city}, ${t.state}, ${t.level}, ${t.age_group}, ${t.gender}, ${t.coach}, ${t.looking_for_players}, ${t.positions_needed}, ${t.season}, ${t.description}, ${t.featured}, 'approved') ON CONFLICT (id) DO NOTHING`;
  }

  // ── Trainers ───────────────────────────────────────────────
  console.log("Seeding trainers...");
  const trainers = [
    { id: "tr1", slug: "coach-mike-rodriguez", name: "Coach Mike Rodriguez", city: "Charlotte", state: "NC", specialty: "Technical Skills & Ball Mastery", experience: "15 years", credentials: "USSF B License, USC Alum", price_range: "$60–80/hr", service_area: "South Charlotte, Fort Mill, Indian Land", description: "Specializing in 1v1 and small group technical development. Former college player with 15 years of private coaching experience.", rating: 4.9, review_count: 47, featured: true },
    { id: "tr2", slug: "elite-touch-training-jen-park", name: "Elite Touch Training – Jen Park", city: "Raleigh", state: "NC", specialty: "Goalkeeper Training", experience: "10 years", credentials: "USSF GK License, Former D1", price_range: "$50–70/hr", service_area: "Raleigh, Cary, Apex", description: "Former D1 goalkeeper specializing in shot stopping, distribution, and positioning for keepers ages 8-18.", rating: 4.8, review_count: 31, featured: true },
    { id: "tr3", slug: "speed-agility-carlos-vega", name: "Speed & Agility Soccer – Carlos Vega", city: "Rock Hill", state: "SC", specialty: "Speed, Agility & Fitness", experience: "8 years", credentials: "CSCS, NASM Certified", price_range: "$45–65/hr", service_area: "Rock Hill, Fort Mill, Clover", description: "Soccer-specific speed and conditioning training. Helping players get faster, more explosive, and reduce injury risk.", rating: 4.7, review_count: 22, featured: false },
    { id: "tr4", slug: "first-touch-academy-devon-walsh", name: "First Touch Academy – Devon Walsh", city: "Charlotte", state: "NC", specialty: "Attacking & Finishing", experience: "12 years", credentials: "UEFA B License", price_range: "$70–90/hr", service_area: "Ballantyne, Waxhaw, Pineville", description: "Elite finishing and attacking movement training. Former professional player with experience coaching at the academy level.", rating: 4.9, review_count: 55, featured: true },
  ];
  for (const t of trainers) {
    await sql`INSERT INTO trainers (id, slug, name, city, state, specialty, experience, credentials, price_range, service_area, description, rating, review_count, featured, status) VALUES (${t.id}, ${t.slug}, ${t.name}, ${t.city}, ${t.state}, ${t.specialty}, ${t.experience}, ${t.credentials}, ${t.price_range}, ${t.service_area}, ${t.description}, ${t.rating}, ${t.review_count}, ${t.featured}, 'approved') ON CONFLICT (id) DO NOTHING`;
  }

  // ── Camps ──────────────────────────────────────────────────
  console.log("Seeding camps...");
  const camps = [
    { id: "ca1", slug: "charlotte-fc-summer-elite-camp", name: "Charlotte FC Summer Elite Camp", organizer_name: "Charlotte FC Youth Academy", city: "Charlotte", state: "NC", camp_type: "Elite ID Camp", age_range: "U10–U14", dates: "Jun 15–19, 2026", price: "$350", gender: "Boys & Girls", description: "5-day intensive camp with MLS Next coaching staff. Top performers invited to academy tryouts. Includes jersey, ball, and daily lunch.", registration_url: "https://charlottefc.com/camps", featured: true },
    { id: "ca2", slug: "nc-fusion-goalkeeper-clinic", name: "NC Fusion Goalkeeper Clinic", organizer_name: "NC Fusion", city: "Greensboro", state: "NC", camp_type: "Position-Specific Clinic", age_range: "U10–U18", dates: "Jul 8–10, 2026", price: "$175", gender: "Boys & Girls", description: "3-day goalkeeper-specific clinic focusing on shot stopping, distribution, footwork, and game management.", registration_url: null, featured: true },
    { id: "ca3", slug: "summer-soccer-fundamentals", name: "Summer Soccer FunDamentals", organizer_name: "South Charlotte Soccer Association", city: "Charlotte", state: "NC", camp_type: "Recreational Camp", age_range: "U4–U10", dates: "Jun 23–27, 2026", price: "$150", gender: "Boys & Girls", description: "Week-long camp introducing young players to soccer through fun, age-appropriate games and activities. Half-day format (9am–12pm).", registration_url: null, featured: false },
    { id: "ca4", slug: "cesa-college-showcase", name: "CESA College Showcase Camp", organizer_name: "CESA", city: "Charlotte", state: "NC", camp_type: "College Showcase", age_range: "U15–U19", dates: "Jul 20–22, 2026", price: "$275", gender: "Boys & Girls", description: "Train in front of 30+ college coaches from D1, D2, and D3 programs. Includes game play, training sessions, and a college recruiting seminar.", registration_url: null, featured: true },
    { id: "ca5", slug: "speed-power-clinic", name: "Speed & Power Soccer Clinic", organizer_name: "Coach Carlos Vega", city: "Rock Hill", state: "SC", camp_type: "Specialty Clinic", age_range: "U12–U18", dates: "Mar 28–29, 2026", price: "$95", gender: "Boys & Girls", description: "Weekend clinic focused on explosive speed, agility ladder work, and soccer-specific conditioning.", registration_url: null, featured: false },
  ];
  for (const c of camps) {
    await sql`INSERT INTO camps (id, slug, name, organizer_name, city, state, camp_type, age_range, dates, price, gender, description, registration_url, featured, status) VALUES (${c.id}, ${c.slug}, ${c.name}, ${c.organizer_name}, ${c.city}, ${c.state}, ${c.camp_type}, ${c.age_range}, ${c.dates}, ${c.price}, ${c.gender}, ${c.description}, ${c.registration_url}, ${c.featured}, 'approved') ON CONFLICT (id) DO NOTHING`;
  }

  // ── Guest Opportunities ────────────────────────────────────
  console.log("Seeding guest opportunities...");
  const guests = [
    { id: "g1", slug: "charlotte-fc-2011-jefferson-cup", team_name: "Charlotte FC 2011 Boys", city: "Charlotte", state: "NC", level: "MLS Next", age_group: "2011", gender: "Boys", dates: "Mar 15–17, 2026", tournament: "Jefferson Cup", positions_needed: "GK, RB", contact_email: "guest@charlottefc.com", description: "Looking for 2 guest players for Jefferson Cup. Must have MLS Next or ECNL-level experience.", featured: true },
    { id: "g2", slug: "nc-fusion-2013-ecnl-national", team_name: "NC Fusion ECNL 2013 Girls", city: "Greensboro", state: "NC", level: "ECNL", age_group: "2013", gender: "Girls", dates: "Apr 5–7, 2026", tournament: "ECNL National Event", positions_needed: "CM, LW", contact_email: "recruiting@ncfusion.org", description: "Need 2 guest players for ECNL National Event. ECNL or equivalent level required.", featured: true },
    { id: "g3", slug: "cesa-2012-disney-showcase", team_name: "CESA 2012 Boys", city: "Charlotte", state: "NC", level: "GA", age_group: "2012", gender: "Boys", dates: "Mar 22–24, 2026", tournament: "Disney Showcase", positions_needed: "ST", contact_email: "teams@cesasoccer.com", description: "Looking for a striker for the Disney Showcase. High-level tournament experience preferred.", featured: false },
  ];
  for (const g of guests) {
    await sql`INSERT INTO guest_opportunities (id, slug, team_name, city, state, level, age_group, gender, dates, tournament, positions_needed, contact_email, description, featured, status) VALUES (${g.id}, ${g.slug}, ${g.team_name}, ${g.city}, ${g.state}, ${g.level}, ${g.age_group}, ${g.gender}, ${g.dates}, ${g.tournament}, ${g.positions_needed}, ${g.contact_email}, ${g.description}, ${g.featured}, 'approved') ON CONFLICT (id) DO NOTHING`;
  }

  // ── Blog Posts ─────────────────────────────────────────────
  console.log("Seeding blog posts...");
  const posts = [
    { id: "b1", slug: "ecnl-vs-mls-next", title: "ECNL vs MLS Next: Which Path Is Right for Your Player?", excerpt: "Breaking down the two premier youth soccer development pathways to help parents make an informed decision about their child's soccer future.", content: "", category: "Player Development", date: "Feb 20, 2026", read_time: "8 min", featured: true },
    { id: "b2", slug: "tryout-season-guide-carolinas", title: "The Complete Guide to Soccer Tryout Season in the Carolinas", excerpt: "Everything you need to know about tryout timelines, what to expect, and how to prepare your player for success.", content: "", category: "Tryouts", date: "Feb 15, 2026", read_time: "12 min", featured: true },
    { id: "b3", slug: "why-home-training-matters", title: "Why Home Training Is the #1 Differentiator for Youth Players", excerpt: "Research shows players who train consistently outside of team practice develop faster. Here's how to structure an effective home training program.", content: "", category: "Training Tips", date: "Feb 10, 2026", read_time: "6 min", featured: true },
    { id: "b4", slug: "guest-playing-guide", title: "Guest Playing: How to Get Exposure Without Switching Clubs", excerpt: "A practical guide to guest playing opportunities, tournament rules, and how to make the most of every chance to be seen.", content: "", category: "Player Development", date: "Feb 5, 2026", read_time: "7 min", featured: false },
    { id: "b5", slug: "questions-before-joining-club", title: "5 Questions to Ask Before Joining a New Soccer Club", excerpt: "Don't commit before asking these critical questions about coaching philosophy, costs, travel, and player development approach.", content: "", category: "Club Selection", date: "Jan 28, 2026", read_time: "5 min", featured: false },
    { id: "b6", slug: "best-soccer-camps-north-carolina-2026", title: "Best Soccer Camps in North Carolina for Summer 2026", excerpt: "Our curated list of the top soccer camps across NC — from elite ID camps to fun recreational programs for beginners.", content: "", category: "Camps", date: "Jan 20, 2026", read_time: "10 min", featured: false },
  ];
  for (const p of posts) {
    await sql`INSERT INTO blog_posts (id, slug, title, excerpt, content, category, date, read_time, featured) VALUES (${p.id}, ${p.slug}, ${p.title}, ${p.excerpt}, ${p.content}, ${p.category}, ${p.date}, ${p.read_time}, ${p.featured}) ON CONFLICT (id) DO NOTHING`;
  }

  // ── Tournaments ─────────────────────────────────────────────
  console.log("Seeding tournaments...");
  const tournaments = [
    { id: "tn1", slug: "jefferson-cup-2026", name: "Jefferson Cup 2026", organizer: "Richmond Strikers", city: "Richmond", state: "VA", dates: "Mar 14–16, 2026", age_groups: "U9–U19", gender: "Boys & Girls", level: "Open / ECNL / MLS Next", entry_fee: "$1,200/team", format: "11v11", description: "One of the most prestigious youth soccer tournaments on the East Coast. Over 1,000 teams competing across multiple age groups and levels.", registration_url: "https://jeffersoncup.com", featured: true },
    { id: "tn2", slug: "disney-soccer-showcase-2026", name: "Disney Soccer Showcase 2026", organizer: "Disney Sports", city: "Orlando", state: "FL", dates: "Mar 20–23, 2026", age_groups: "U10–U19", gender: "Boys & Girls", level: "Open / Premier", entry_fee: "$1,400/team", format: "11v11", description: "Play at ESPN Wide World of Sports Complex at Walt Disney World. A premier showcase event with college coach attendance.", registration_url: "https://disneysports.com/soccer", featured: true },
    { id: "tn3", slug: "carolina-cup-spring-2026", name: "Carolina Cup Spring Classic", organizer: "CESA", city: "Charlotte", state: "NC", dates: "Apr 12–13, 2026", age_groups: "U8–U15", gender: "Boys & Girls", level: "Recreational / Competitive", entry_fee: "$600/team", format: "7v7 / 9v9 / 11v11", description: "Charlotte's premier spring tournament for recreational and competitive teams. Age-appropriate formats with professional referees.", registration_url: "https://cesasoccer.com/tournaments", featured: true },
    { id: "tn4", slug: "ecnl-southeast-conference-event", name: "ECNL Southeast Conference Event", organizer: "ECNL", city: "Greensboro", state: "NC", dates: "May 3–4, 2026", age_groups: "U13–U17", gender: "Girls", level: "ECNL", entry_fee: "Included in ECNL fees", format: "11v11", description: "Official ECNL conference event for Southeast conference teams. Heavy college coach attendance expected.", featured: false },
    { id: "tn5", slug: "rock-hill-memorial-day-classic", name: "Rock Hill Memorial Day Classic", organizer: "Carolina Rapids", city: "Rock Hill", state: "SC", dates: "May 24–25, 2026", age_groups: "U8–U18", gender: "Boys & Girls", level: "Open", entry_fee: "$500/team", format: "7v7 / 9v9 / 11v11", description: "Annual Memorial Day weekend tournament with teams from across the Southeast. Great competition and a fun holiday weekend atmosphere.", featured: false },
  ];
  for (const t of tournaments) {
    await sql`INSERT INTO tournaments (id, slug, name, organizer, city, state, dates, age_groups, gender, level, entry_fee, format, description, registration_url, featured, status) VALUES (${t.id}, ${t.slug}, ${t.name}, ${t.organizer}, ${t.city}, ${t.state}, ${t.dates}, ${t.age_groups}, ${t.gender}, ${t.level}, ${t.entry_fee}, ${t.format}, ${t.description}, ${t.registration_url || null}, ${t.featured}, 'approved') ON CONFLICT (id) DO NOTHING`;
  }

  console.log("Seed complete!");
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
