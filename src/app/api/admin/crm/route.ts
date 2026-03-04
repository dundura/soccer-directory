import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getCrmContacts, getCrmGroups, addCrmContact, updateCrmContact, deleteCrmContact, addCrmGroup, updateCrmGroupOrder, deleteCrmGroup } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await getUserByEmail(session.user.email);
  return user?.role === "admin";
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const [contacts, groups] = await Promise.all([getCrmContacts(), getCrmGroups()]);
    return NextResponse.json({ contacts, groups });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    if (body.action === "addGroup") {
      if (!body.name) return NextResponse.json({ error: "Name required" }, { status: 400 });
      await addCrmGroup(body.name);
    } else {
      await addCrmContact(body);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    if (body.action === "reorderGroups") {
      await updateCrmGroupOrder(body.groups);
    } else {
      await updateCrmContact(body.id, body);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id, action } = await req.json();
    if (action === "deleteGroup") {
      await deleteCrmGroup(id);
    } else {
      await deleteCrmContact(id);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
