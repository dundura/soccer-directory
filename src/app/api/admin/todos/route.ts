import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getAdminTodos, addAdminTodo, updateAdminTodo, deleteAdminTodo } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await getUserByEmail(session.user.email);
  return user?.role === "admin";
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const todos = await getAdminTodos();
    return NextResponse.json(todos);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { item, notes } = await req.json();
    if (!item) return NextResponse.json({ error: "Item required" }, { status: 400 });
    await addAdminTodo(item, notes || "");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id, ...data } = await req.json();
    await updateAdminTodo(id, data);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await req.json();
    await deleteAdminTodo(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
