import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPasswordResetToken, deletePasswordResetToken, updateUserPassword } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const reset = await getPasswordResetToken(token);
    if (!reset) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    if (new Date(reset.expiresAt) < new Date()) {
      await deletePasswordResetToken(token);
      return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updateUserPassword(reset.email, passwordHash);
    await deletePasswordResetToken(token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
