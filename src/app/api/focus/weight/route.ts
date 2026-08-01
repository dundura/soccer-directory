import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

/**
 * Weight log: one reading per day, plus a single goal (target weight and the
 * date to hit it by).
 *
 * One row per day rather than per entry — weighing twice in a morning should
 * correct the day, not add a second point to the chart. That is what the
 * UNIQUE (user_email, day) and the upsert below are for.
 */

/**
 * Neon returns a DATE as a Date object, and String(date) gives
 * "Tue Jul 29 2026 ..." — slicing that yields "Tue Jul 29", which is not a
 * date. Normalise to YYYY-MM-DD from either shape.
 */
function isoDay(value: unknown): string {
  if (value instanceof Date) {
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
  }
  return String(value).slice(0, 10);
}

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS focus_weight (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      day DATE NOT NULL,
      weight NUMERIC(6,2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_email, day)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS focus_weight_goal (
      user_email TEXT PRIMARY KEY,
      goal_weight NUMERIC(6,2),
      start_weight NUMERIC(6,2),
      target_date DATE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

/** GET — every reading newest first, plus the goal. */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTables();

    const rows = await sql`
      SELECT day, weight
      FROM focus_weight
      WHERE user_email = ${session.user.email}
      ORDER BY day DESC
    `;
    const goalRows = await sql`
      SELECT goal_weight, start_weight, target_date
      FROM focus_weight_goal
      WHERE user_email = ${session.user.email}
    `;

    const entries = (rows as { day: unknown; weight: string }[]).map((r) => ({
      day: isoDay(r.day),
      weight: Number(r.weight),
    }));

    const g = (goalRows as { goal_weight: string | null; start_weight: string | null; target_date: unknown }[])[0];
    const goal = g
      ? {
          goalWeight: g.goal_weight === null ? null : Number(g.goal_weight),
          startWeight: g.start_weight === null ? null : Number(g.start_weight),
          targetDate: g.target_date ? isoDay(g.target_date) : null,
        }
      : { goalWeight: null, startWeight: null, targetDate: null };

    return NextResponse.json({ entries, goal });
  } catch (err) {
    console.error("[focus/weight] GET", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

/** POST — record (or correct) one day's weight. */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTables();

    const { day, weight } = await req.json();
    const value = Number(weight);
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(String(day))) {
      return NextResponse.json({ error: "A date is required" }, { status: 400 });
    }
    // Guard the range as well as the type: a typo like 1500 would wreck every
    // average and trend on the page.
    if (!Number.isFinite(value) || value <= 0 || value > 1000) {
      return NextResponse.json({ error: "Enter a weight between 1 and 1000" }, { status: 400 });
    }

    await sql`
      INSERT INTO focus_weight (user_email, day, weight)
      VALUES (${session.user.email}, ${day}, ${value})
      ON CONFLICT (user_email, day)
      DO UPDATE SET weight = EXCLUDED.weight
    `;

    // The first reading doubles as the starting point, so progress has
    // something to measure from without asking for it twice.
    await sql`
      INSERT INTO focus_weight_goal (user_email, start_weight)
      VALUES (${session.user.email}, ${value})
      ON CONFLICT (user_email) DO UPDATE
        SET start_weight = COALESCE(focus_weight_goal.start_weight, EXCLUDED.start_weight)
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[focus/weight] POST", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

/** PUT — set the goal weight and the date to reach it by. */
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await ensureTables();

    const { goalWeight, targetDate, startWeight } = await req.json();
    const goal = goalWeight === null || goalWeight === "" ? null : Number(goalWeight);
    const start = startWeight === null || startWeight === "" || startWeight === undefined ? undefined : Number(startWeight);

    if (goal !== null && (!Number.isFinite(goal) || goal <= 0 || goal > 1000)) {
      return NextResponse.json({ error: "Enter a goal between 1 and 1000" }, { status: 400 });
    }
    if (targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(String(targetDate))) {
      return NextResponse.json({ error: "Invalid target date" }, { status: 400 });
    }

    await sql`
      INSERT INTO focus_weight_goal (user_email, goal_weight, target_date, updated_at)
      VALUES (${session.user.email}, ${goal}, ${targetDate || null}, NOW())
      ON CONFLICT (user_email) DO UPDATE
        SET goal_weight = EXCLUDED.goal_weight,
            target_date = EXCLUDED.target_date,
            updated_at  = NOW()
    `;

    if (start !== undefined && Number.isFinite(start) && start > 0) {
      await sql`
        UPDATE focus_weight_goal SET start_weight = ${start} WHERE user_email = ${session.user.email}
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[focus/weight] PUT", err);
    return NextResponse.json({ error: "Failed to save goal" }, { status: 500 });
  }
}

/** DELETE — remove one day's reading. */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const day = new URL(req.url).searchParams.get("day");
    if (!day) return NextResponse.json({ error: "day required" }, { status: 400 });

    await sql`
      DELETE FROM focus_weight
      WHERE user_email = ${session.user.email} AND day = ${day}
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[focus/weight] DELETE", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
