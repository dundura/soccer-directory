import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY!);
const NOTIFY_EMAIL = "neil@anytime-soccer.com";

interface TaskRow {
  id: number;
  text: string;
  notes: string | null;
  due_date: string;
  client_name: string;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

function buildEmail(todayTasks: TaskRow[], tomorrowTasks: TaskRow[], todayStr: string): string {
  const hasTomorrow = tomorrowTasks.length > 0;

  // Group today's tasks by client
  const byClient: Record<string, TaskRow[]> = {};
  for (const t of todayTasks) {
    if (!byClient[t.client_name]) byClient[t.client_name] = [];
    byClient[t.client_name].push(t);
  }

  const clientBlocks = Object.entries(byClient).map(([clientName, tasks]) => `
    <div style="margin-bottom: 20px;">
      <div style="font-size: 13px; font-weight: 700; color: #0F3154; text-transform: uppercase;
                  letter-spacing: 0.07em; margin-bottom: 8px; padding-bottom: 6px;
                  border-bottom: 2px solid #E1E8EF;">
        ${clientName}
      </div>
      ${tasks.map(t => `
        <div style="display: flex; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #F1F5F9;">
          <div style="width: 18px; height: 18px; border-radius: 4px; border: 2px solid #CBD5E1;
                      flex-shrink: 0; margin-right: 12px; margin-top: 1px;"></div>
          <div>
            <div style="font-size: 14px; color: #0F3154; font-weight: 600; line-height: 1.4;">${t.text}</div>
            ${t.notes ? `<div style="font-size: 12px; color: #64748b; margin-top: 3px;">${t.notes}</div>` : ""}
          </div>
        </div>
      `).join("")}
    </div>
  `).join("");

  const tomorrowBlock = hasTomorrow ? `
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px;
                padding: 20px 24px; margin: 28px 0 0;">
      <div style="font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase;
                  letter-spacing: 0.07em; margin-bottom: 12px;">🗓 Coming up tomorrow</div>
      ${tomorrowTasks.map(t => `
        <div style="font-size: 13px; color: #78350f; padding: 5px 0; border-bottom: 1px solid #fde68a;">
          <span style="font-weight: 600;">${t.client_name}</span>
          <span style="color: #b45309;"> · </span>${t.text}
          ${t.notes ? `<span style="color: #a16207; font-size: 12px;"> — ${t.notes}</span>` : ""}
        </div>
      `).join("")}
    </div>
  ` : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9;
             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">

    <!-- Header -->
    <div style="background: #0F3154; border-radius: 16px 16px 0 0; padding: 28px 28px 24px;">
      <div style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5);
                  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">
        Daily Task Reminder
      </div>
      <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 4px; font-weight: 800;">
        ${todayTasks.length} task${todayTasks.length !== 1 ? "s" : ""} due today
      </h1>
      <div style="color: rgba(255,255,255,0.55); font-size: 14px;">${formatDate(todayStr)}</div>
    </div>

    <!-- Body -->
    <div style="background: #ffffff; padding: 28px 28px 24px;
                border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">

      ${clientBlocks}
      ${tomorrowBlock}

      <!-- CTA -->
      <div style="text-align: center; margin-top: 28px;">
        <a href="https://www.soccer-near-me.com/focus"
           style="display: inline-block; padding: 13px 32px; background: #DC373E;
                  color: #ffffff; text-decoration: none; border-radius: 10px;
                  font-weight: 700; font-size: 14px;">
          Open Focus Dashboard →
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; border-radius: 0 0 16px 16px;
                border: 1px solid #e5e7eb; border-top: none;
                padding: 16px 28px; text-align: center;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        soccer-near-me.com · Focus Dashboard
      </p>
    </div>

  </div>
</body>
</html>`;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Tasks due today
    const todayTasks = await sql`
      SELECT a.id, a.text, a.notes, a.due_date::text, c.name as client_name
      FROM focus_client_activities a
      JOIN focus_clients c ON c.id = a.client_id
      WHERE a.due_date = CURRENT_DATE
        AND (a.completed IS NULL OR a.completed = false)
      ORDER BY c.name, a.created_at
    ` as TaskRow[];

    // Tasks due tomorrow (preview)
    const tomorrowTasks = await sql`
      SELECT a.id, a.text, a.notes, a.due_date::text, c.name as client_name
      FROM focus_client_activities a
      JOIN focus_clients c ON c.id = a.client_id
      WHERE a.due_date = CURRENT_DATE + INTERVAL '1 day'
        AND (a.completed IS NULL OR a.completed = false)
      ORDER BY c.name, a.created_at
    ` as TaskRow[];

    // Only send email if there's something due today
    if (todayTasks.length === 0) {
      return NextResponse.json({ success: true, message: "No tasks due today — no email sent." });
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    await resend.emails.send({
      from: "Soccer Near Me <notifications@soccer-near-me.com>",
      to: NOTIFY_EMAIL,
      subject: `📋 ${todayTasks.length} task${todayTasks.length !== 1 ? "s" : ""} due today — ${formatDate(todayStr)}`,
      html: buildEmail(todayTasks, tomorrowTasks, todayStr),
    });

    return NextResponse.json({
      success: true,
      tasksDueToday: todayTasks.length,
      tasksDueTomorrow: tomorrowTasks.length,
    });
  } catch (err) {
    console.error("Task reminder cron error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
