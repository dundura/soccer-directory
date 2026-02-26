import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getListingContact } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const NOTIFY_EMAIL = "neil@anytime-soccer.com";

type Props = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const { name, email, team, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const listing = await getListingContact("player", slug);
    if (!listing) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    if (resend) {
      const recipients = [NOTIFY_EMAIL];
      if (listing.email && listing.email !== NOTIFY_EMAIL) {
        recipients.push(listing.email);
      }

      await resend.emails.send({
        from: "Soccer Near Me <notifications@soccer-near-me.com>",
        to: recipients,
        replyTo: email,
        subject: `New inquiry for player profile: ${listing.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #1a365d;">New Player Profile Inquiry</h2>
            <p style="color: #666;">Someone is interested in the player profile for ${listing.name} on Soccer Near Me.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 0; color: #666; width: 120px;">Player</td><td style="padding: 8px 0; font-weight: bold;">${listing.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">From</td><td style="padding: 8px 0; font-weight: bold;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              ${team ? `<tr><td style="padding: 8px 0; color: #666;">Team/Club</td><td style="padding: 8px 0;">${team}</td></tr>` : ""}
            </table>
            <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <a href="https://www.soccer-near-me.com/guest-play/players/${slug}" style="display: inline-block; padding: 12px 24px; background: #DC373E; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">View Profile</a>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
