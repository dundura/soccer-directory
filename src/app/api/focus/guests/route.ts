import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGuestBookings, addGuestBooking, updateGuestBooking, deleteGuestBooking } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await getGuestBookings();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { guestName, email, phone, notes, links, status, update } = await req.json();
  if (!guestName?.trim()) return NextResponse.json({ error: "guestName required" }, { status: 400 });
  const row = await addGuestBooking({
    guestName: guestName.trim(),
    email: email || "",
    phone: phone || "",
    notes: notes || "",
    links: links || [],
    status: status || "upcoming",
    update: update || "",
  });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const row = await updateGuestBooking(id, data);
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteGuestBooking(id);
  return NextResponse.json({ success: true });
}
