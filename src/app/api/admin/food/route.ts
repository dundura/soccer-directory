import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getFoodLog, addFoodEntry, deleteFoodEntry } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await getUserByEmail(session.user.email);
  return user?.role === "admin";
}

export async function GET(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const entries = await getFoodLog(date);
    return NextResponse.json(entries);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { date, mealType, kind, description } = await req.json();
    if (!description) return NextResponse.json({ error: "Description required" }, { status: 400 });
    await addFoodEntry(date, mealType || "snack", kind || "planned", description);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await req.json();
    await deleteFoodEntry(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
