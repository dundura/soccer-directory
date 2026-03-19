import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getCrmContacts, getCrmGroups, addCrmContact, updateCrmContact, deleteCrmContact, addCrmGroup, updateCrmGroupOrder, deleteCrmGroup, getCrmComments, addCrmComment, deleteCrmComment } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await getUserByEmail(session.user.email);
  return user?.role === "admin" ? { email: user.email, name: user.name } : null;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const [contacts, groups, comments] = await Promise.all([getCrmContacts(), getCrmGroups(), getCrmComments()]);
    return NextResponse.json({ contacts, groups, comments });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    if (body.action === "addGroup") {
      if (!body.name) return NextResponse.json({ error: "Name required" }, { status: 400 });
      await addCrmGroup(body.name);
    } else if (body.action === "comment") {
      if (!body.contactId || !body.body) return NextResponse.json({ error: "Comment required" }, { status: 400 });
      await addCrmComment(body.contactId, body.body, admin.name, admin.email);
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
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id, action } = await req.json();
    if (action === "deleteGroup") {
      await deleteCrmGroup(id);
    } else if (action === "comment") {
      await deleteCrmComment(id);
    } else {
      await deleteCrmContact(id);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
