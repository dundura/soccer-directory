import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function getUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

// GET — fetch data for a specific table + player
export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const playerId = searchParams.get("playerId");
  const table = searchParams.get("table");

  if (!playerId || !table) {
    return NextResponse.json({ error: "Missing playerId or table" }, { status: 400 });
  }

  // Verify ownership
  const owner = await sql`SELECT id FROM player_profiles WHERE id = ${playerId} AND user_id = ${userId} LIMIT 1`;
  if (owner.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = ["player_calendar_events", "player_goals", "player_training_logs", "player_game_stats", "player_notes"];
  if (!allowed.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  let rows;
  if (table === "player_calendar_events") {
    rows = await sql`SELECT * FROM player_calendar_events WHERE player_id = ${playerId} AND user_id = ${userId} ORDER BY event_date DESC`;
  } else if (table === "player_goals") {
    rows = await sql`SELECT * FROM player_goals WHERE player_id = ${playerId} AND user_id = ${userId} ORDER BY created_at DESC`;
  } else if (table === "player_training_logs") {
    rows = await sql`SELECT * FROM player_training_logs WHERE player_id = ${playerId} AND user_id = ${userId} ORDER BY session_date DESC`;
  } else if (table === "player_game_stats") {
    rows = await sql`SELECT * FROM player_game_stats WHERE player_id = ${playerId} AND user_id = ${userId} ORDER BY game_date DESC`;
  } else {
    rows = await sql`SELECT * FROM player_notes WHERE player_id = ${playerId} AND user_id = ${userId} ORDER BY created_at DESC`;
  }
  return NextResponse.json(rows);
}

// POST — create a new row
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { playerId, table, ...data } = body;

  if (!playerId || !table) {
    return NextResponse.json({ error: "Missing playerId or table" }, { status: 400 });
  }

  const owner = await sql`SELECT id FROM player_profiles WHERE id = ${playerId} AND user_id = ${userId} LIMIT 1`;
  if (owner.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (table === "player_calendar_events") {
    const rows = await sql`INSERT INTO player_calendar_events (player_id, user_id, title, event_type, event_date, start_time, end_time, location, notes)
      VALUES (${playerId}, ${userId}, ${data.title}, ${data.eventType || "other"}, ${data.eventDate}, ${data.startTime || null}, ${data.endTime || null}, ${data.location || null}, ${data.notes || null})
      RETURNING *`;
    return NextResponse.json(rows[0]);
  }

  if (table === "player_goals") {
    const rows = await sql`INSERT INTO player_goals (player_id, user_id, title, category, target_date, notes)
      VALUES (${playerId}, ${userId}, ${data.title}, ${data.category || "general"}, ${data.targetDate || null}, ${data.notes || null})
      RETURNING *`;
    return NextResponse.json(rows[0]);
  }

  if (table === "player_training_logs") {
    const rows = await sql`INSERT INTO player_training_logs (player_id, user_id, session_date, duration_minutes, session_type, focus_area, intensity, notes)
      VALUES (${playerId}, ${userId}, ${data.sessionDate}, ${data.durationMinutes || 0}, ${data.sessionType || "individual"}, ${data.focusArea || null}, ${data.intensity || "medium"}, ${data.notes || null})
      RETURNING *`;
    return NextResponse.json(rows[0]);
  }

  if (table === "player_game_stats") {
    const rows = await sql`INSERT INTO player_game_stats (player_id, user_id, game_date, opponent, result, minutes_played, goals, assists, shots, passes, tackles, saves, notes)
      VALUES (${playerId}, ${userId}, ${data.gameDate}, ${data.opponent || null}, ${data.result || null}, ${data.minutesPlayed || 0}, ${data.goals || 0}, ${data.assists || 0}, ${data.shots || 0}, ${data.passes || 0}, ${data.tackles || 0}, ${data.saves || 0}, ${data.notes || null})
      RETURNING *`;
    return NextResponse.json(rows[0]);
  }

  if (table === "player_notes") {
    const rows = await sql`INSERT INTO player_notes (player_id, user_id, title, body, category)
      VALUES (${playerId}, ${userId}, ${data.title}, ${data.body || null}, ${data.category || "general"})
      RETURNING *`;
    return NextResponse.json(rows[0]);
  }

  return NextResponse.json({ error: "Invalid table" }, { status: 400 });
}

// PUT — update a row
export async function PUT(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, table, ...data } = body;

  if (!id || !table) {
    return NextResponse.json({ error: "Missing id or table" }, { status: 400 });
  }

  if (table === "player_calendar_events") {
    await sql`UPDATE player_calendar_events SET title = ${data.title}, event_type = ${data.eventType || "other"}, event_date = ${data.eventDate}, start_time = ${data.startTime || null}, end_time = ${data.endTime || null}, location = ${data.location || null}, notes = ${data.notes || null} WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ ok: true });
  }

  if (table === "player_goals") {
    await sql`UPDATE player_goals SET title = ${data.title}, category = ${data.category || "general"}, target_date = ${data.targetDate || null}, status = ${data.status || "active"}, progress = ${data.progress ?? 0}, notes = ${data.notes || null}, updated_at = NOW() WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ ok: true });
  }

  if (table === "player_training_logs") {
    await sql`UPDATE player_training_logs SET session_date = ${data.sessionDate}, duration_minutes = ${data.durationMinutes || 0}, session_type = ${data.sessionType || "individual"}, focus_area = ${data.focusArea || null}, intensity = ${data.intensity || "medium"}, notes = ${data.notes || null} WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ ok: true });
  }

  if (table === "player_game_stats") {
    await sql`UPDATE player_game_stats SET game_date = ${data.gameDate}, opponent = ${data.opponent || null}, result = ${data.result || null}, minutes_played = ${data.minutesPlayed || 0}, goals = ${data.goals || 0}, assists = ${data.assists || 0}, shots = ${data.shots || 0}, passes = ${data.passes || 0}, tackles = ${data.tackles || 0}, saves = ${data.saves || 0}, notes = ${data.notes || null} WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ ok: true });
  }

  if (table === "player_notes") {
    await sql`UPDATE player_notes SET title = ${data.title}, body = ${data.body || null}, category = ${data.category || "general"}, updated_at = NOW() WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid table" }, { status: 400 });
}

// DELETE — remove a row
export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, table } = body;

  if (!id || !table) {
    return NextResponse.json({ error: "Missing id or table" }, { status: 400 });
  }

  const allowed = ["player_calendar_events", "player_goals", "player_training_logs", "player_game_stats", "player_notes"];
  if (!allowed.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  if (table === "player_calendar_events") {
    await sql`DELETE FROM player_calendar_events WHERE id = ${id} AND user_id = ${userId}`;
  } else if (table === "player_goals") {
    await sql`DELETE FROM player_goals WHERE id = ${id} AND user_id = ${userId}`;
  } else if (table === "player_training_logs") {
    await sql`DELETE FROM player_training_logs WHERE id = ${id} AND user_id = ${userId}`;
  } else if (table === "player_game_stats") {
    await sql`DELETE FROM player_game_stats WHERE id = ${id} AND user_id = ${userId}`;
  } else {
    await sql`DELETE FROM player_notes WHERE id = ${id} AND user_id = ${userId}`;
  }
  return NextResponse.json({ ok: true });
}
