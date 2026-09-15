// Load club contacts into the cold_drip queue (see src/app/api/cron/cold-drip).
//
//   node scripts/queue-cold-drip.mjs            dry run: prints the schedule
//   node scripts/queue-cold-drip.mjs --commit   writes it
//
// Eight a day, weekdays only, starting START, and never two people from the
// same club on the same morning.
import fs from "node:fs";
import { neon } from "@neondatabase/serverless";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^DATABASE_URL=(.*)$/);
  if (m) process.env.DATABASE_URL = m[1].replace(/^"|"$/g, "");
}
const sql = neon(process.env.DATABASE_URL);

const START = "2026-09-16";
const PER_DAY = 8;
const COMMIT = process.argv.includes("--commit");

// [club, contact name, email]. From Neil's list, 2026-09-15. Skipped: John
// Helmig (no email), and Kevin (Number5911@yahoo.com) and Nikki
// (swmnh01@yahoo.com), who have no club to put in "Listing {club}".
// Duplicate addresses appear once. Lindsay and Mohamed had no club on the
// sheet; the club is read off their email domain.
const CONTACTS = [
  ["NBT Soccer", "Matthew Mozynski", "mmozynski@nbtsoccer.com"],
  ["NBT Soccer", "Brandon Mitchell", "bmitchell@nbtsoccer.com"],
  ["MAYSL", "Maria Brown", "president@maysl.org"],
  ["MAYSL", "Tabby Lesko", "vp@maysl.org"],
  ["Sacramento United", "Alberto Regolato", "president@sacunited.com"],
  ["Sacramento United", "Reymond Harris", "r.harris@sacunited.com"],
  ["Sacramento United", null, "membership@sacunited.com"],
  ["Sacramento United", "Zak Gordon", "z.gordon@sacunited.com"],
  ["Sacramento United", "Ish Echeverria", "i.echeverria@sacunited.com"],
  ["Sacramento United", "Brent Sasaki", "vicepresident@sacunited.com"],
  ["Mount Pleasant Soccer Club", "Josh Smith", "president@mpsoccerclub.org"],
  ["Mount Pleasant Soccer Club", "Matt Rogers", "matt_rogers203@hotmail.com"],
  ["Mount Pleasant Soccer Club", "John Bunting", "jbunting@mtpleasant.edzone.net"],
  ["Mount Pleasant Soccer Club", "Kendra Brown", "board@mpsoccerclub.org"],
  ["Merrimack Soccer Club", "Katie Schwartz", "youthdirector@myasoccer.org"],
  ["Merrimack Soccer Club", "Tom Bellen", "training@myasoccer.org"],
  ["Northern Strikers", "Drew Williams", "doc@northernstrikers.com"],
  ["Northern Strikers", "Kevin Barthel", "president@northernstrikers.com"],
  ["Timberlane Youth Soccer", "Erika Lundin", "nhtysl@timberlaneyouthsoccer.org"],
  ["Candia Youth Athletic Association", "Rob Boucher", "soccer@cyaasports.com"],
  ["HB Cavs", "Jackie Lopez", "jacquelynlopez326@gmail.com"],
  ["Winchester Soccer", "Himanshu Patel", "communications@winchestersoccer.net"],
  ["SFC New England", "Gary Crompton", "gcrompton@sfcnewengland.com"],
  ["Wellesley United", "Phillippe Gabriel", "philippegabriel@gmail.com"],
  ["Wellesley United", "Tory Moore", "moorebt@verizon.net"],
  ["Wellesley United", "Joe Morais", "intown@wellesleysoccer.org"],
  ["Needham Soccer", "Courtney Willett", "cdswillett@gmail.com"],
  ["Needham Soccer", "Andy Epstein", "aapstein@hotmail.com"],
  ["Roots Soccer League", "Dave Bartin", "david@rootssoccerleague.com"],
  ["NH Soccer Association", "Ed Royer", "director@nhsoccerleague.com"],
  ["Tuscaloosa United Soccer Club", "Caroline Humphrey", "chumphrey2000@gmail.com"],
  ["RSL Arizona", "Lindsay", "lkelly@rslaz.org"],
  ["Seacoast United", "Mohamed", "mabdirizak@seacoastunited.com"],
  ["Two Touch Soccer", "Tom Worthington", "tom@twotouchsoccer.com"],
  ["Hudson NH Soccer", "Tim Adams", "president@hudsonnhsoccer.org"],
  ["Hudson NH Soccer", "Nick Moreau", "vicepresident@hudsonnhsoccer.org"],
  ["Barrington Soccer Club", "Anthony Vittorioso", "doc@barringtonsoccerclub.org"],
  ["Londonderry Soccer", "Todd Ellis", "todd.ellis@londonderrysoccer.org"],
  ["Londonderry Soccer", "Kerri Stanley", "kerri.stanley@londonderrysoccer.org"],
  ["Londonderry Soccer", "Mike Mantegari", "mike.mantegari@londonderrysoccer.org"],
  ["Texas United", "Gabriel Salazar", "gsalazar@texasunitedfc.com"],
  ["Saints SC", "Ryan Ross", "rross@txsaints.com"],
  ["Saints SC", "Mitchell Kane", "mkane@txsaints.com"],
  ["Avanti Soccer Academy", "Francisco Molina", "fmolina@avantisocceracademy.com"],
  ["Gulf Coast Youth Soccer Club", "Keith Riggs", "keith.riggs@gcysc.com"],
  ["Gulf Coast Youth Soccer Club", "Darren", "tdfoust@mac.com"],
];

// Each weekday takes up to PER_DAY people from DIFFERENT clubs, starting with
// the clubs that have the most people left. Plain round-robin was not enough:
// Sacramento United has six contacts, so its last ones bunched onto the same
// final morning.
const remaining = new Map();
for (const c of CONTACTS) {
  if (!remaining.has(c[0])) remaining.set(c[0], []);
  remaining.get(c[0]).push(c);
}
const schedule = [];
const days = [];
const d = new Date(`${START}T12:00:00Z`);
while ([...remaining.values()].some((l) => l.length)) {
  const wd = d.getUTCDay();
  if (wd !== 0 && wd !== 6) {
    const day = d.toISOString().slice(0, 10);
    const clubs = [...remaining.entries()]
      .filter(([, l]) => l.length)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, PER_DAY);
    for (const [, list] of clubs) {
      const c = list.shift();
      schedule.push({ club: c[0], name: c[1], email: c[2].toLowerCase(), send_on: day });
    }
    days.push(day);
  }
  d.setUTCDate(d.getUTCDate() + 1);
}

// Guard that rule, in case the scheduler above is ever changed.
const seen = new Set();
for (const s of schedule) {
  const key = `${s.send_on}|${s.club}`;
  if (seen.has(key)) throw new Error(`Two ${s.club} contacts on ${s.send_on}`);
  seen.add(key);
}

for (const day of days) {
  const rows = schedule.filter((s) => s.send_on === day);
  console.log(`${day} (${rows.length}): ${rows.map((r) => `${r.club} / ${r.name || "there"}`).join("; ")}`);
}
console.log(`${schedule.length} contacts over ${days.length} weekdays`);

if (!COMMIT) {
  console.log("Dry run. Pass --commit to write.");
  process.exit(0);
}

await sql`CREATE TABLE IF NOT EXISTS cold_drip (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  club TEXT NOT NULL,
  send_on DATE NOT NULL,
  sent_at TIMESTAMPTZ,
  message_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;
let added = 0;
for (const s of schedule) {
  const r = await sql`INSERT INTO cold_drip (email, contact_name, club, send_on)
                      VALUES (${s.email}, ${s.name}, ${s.club}, ${s.send_on})
                      ON CONFLICT (email) DO NOTHING RETURNING id`;
  added += r.length;
}
console.log(`Queued ${added} (${schedule.length - added} already queued)`);
