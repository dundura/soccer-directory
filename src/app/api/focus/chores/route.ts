import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

/**
 * The daily household chores. Stored by index, not by text, so a chore can
 * be reworded later without orphaning a day's ticks — and for the same reason
 * new chores must be appended, never inserted.
 */
export const ITEMS = [
  "Made up bed",
  "Cleaned kitchen",
  "Cleaned sofa",
  "Put away all shoes",
  "Put away all bags",
  "Put away all balls",
];

/**
 * Neon hands a DATE column back as a Date object, and String(date) gives
 * "Tue Jul 29 2026 ..." - slicing that yields "Tue Jul 29", which is not a
 * date at all. Normalise to YYYY-MM-DD from either shape.
 */
function isoDay(value: unknown): string {
  if (value instanceof Date) {
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
  }
  return String(value).slice(0, 10);
}

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS focus_chores (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      day DATE NOT NULL,
      item_idx INT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_email, day, item_idx)
    )
  `;
  await sql`
    CREATE OR REPLACE VIEW focus_chore_daily AS
      SELECT user_email,
             day,
             COUNT(*) FILTER (WHERE done) AS completed,
             COUNT(*) AS total,
             ROUND(100.0 * COUNT(*) FILTER (WHERE done) / NULLIF(COUNT(*), 0)) AS percent
      FROM focus_chores
      GROUP BY user_email, day
  `;
}

/** GET — every day this user has started, newest first, with its ticks. */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTable();

    const rows = await sql`
      SELECT day, item_idx, done
      FROM focus_chores
      WHERE user_email = ${session.user.email}
      ORDER BY day DESC, item_idx ASC
    `;

    const byDay = new Map<string, boolean[]>();
    for (const r of rows as { day: unknown; item_idx: number; done: boolean }[]) {
      const key = isoDay(r.day);
      if (!byDay.has(key)) byDay.set(key, new Array(ITEMS.length).fill(false));
      byDay.get(key)![r.item_idx] = r.done;
    }

    const days = [...byDay.entries()].map(([day, done]) => {
      const complete = done.filter(Boolean).length;
      return {
        day,
        done,
        complete,
        percent: Math.round((complete / ITEMS.length) * 100),
      };
    });

    const tracked = days.length;
    const average = tracked ? Math.round(days.reduce((a, d) => a + d.percent, 0) / tracked) : 0;
    const perfect = days.filter((d) => d.percent === 100).length;

    // A day counts towards the streak once every item is ticked. Counted back
    // from today, and from yesterday if today is not done yet - so an unfinished
    // today does not read as a broken streak before the day is over.
    const scored = new Map(days.map((d) => [d.day, d.percent]));
    const dayBefore = (iso: string) => {
      const [y, m, dd] = iso.split("-").map(Number);
      const t = new Date(Date.UTC(y, m - 1, dd - 1));
      return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
    };

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    let cursor = scored.get(today) === 100 ? today : dayBefore(today);
    let streak = 0;
    while (scored.get(cursor) === 100) {
      streak++;
      cursor = dayBefore(cursor);
    }

    // Longest run of perfect days anywhere in the record.
    const perfectDays = days.filter((d) => d.percent === 100).map((d) => d.day).sort();
    let best = 0, run = 0, prev: string | null = null;
    for (const day of perfectDays) {
      run = prev && dayBefore(day) === prev ? run + 1 : 1;
      if (run > best) best = run;
      prev = day;
    }

    return NextResponse.json({ items: ITEMS, days, summary: { tracked, average, perfect, streak, best } });
  } catch {
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

/** POST { day } — start tracking a day. Existing ticks are left alone. */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTable();

    const body = await req.json().catch(() => ({}));
    const day = String(body.day || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      return NextResponse.json({ error: "A day is needed, as YYYY-MM-DD" }, { status: 400 });
    }

    for (let i = 0; i < ITEMS.length; i++) {
      await sql`
        INSERT INTO focus_chores (user_email, day, item_idx, done)
        VALUES (${session.user.email}, ${day}, ${i}, FALSE)
        ON CONFLICT (user_email, day, item_idx) DO NOTHING
      `;
    }

    return NextResponse.json({ success: true, day });
  } catch {
    return NextResponse.json({ error: "Could not add that day" }, { status: 500 });
  }
}

/** PATCH { day, itemIdx, done } — tick one off, or put it back. */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTable();

    const body = await req.json().catch(() => ({}));
    const day = String(body.day || "").slice(0, 10);
    const itemIdx = Number(body.itemIdx);
    const done = !!body.done;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isInteger(itemIdx) || itemIdx < 0 || itemIdx >= ITEMS.length) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    await sql`
      INSERT INTO focus_chores (user_email, day, item_idx, done)
      VALUES (${session.user.email}, ${day}, ${itemIdx}, ${done})
      ON CONFLICT (user_email, day, item_idx) DO UPDATE SET done = ${done}
    `;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not save that" }, { status: 500 });
  }
}

/** DELETE ?day= — drop a day entirely. */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const day = String(searchParams.get("day") || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    await sql`DELETE FROM focus_chores WHERE user_email = ${session.user.email} AND day = ${day}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not remove that day" }, { status: 500 });
  }
}
