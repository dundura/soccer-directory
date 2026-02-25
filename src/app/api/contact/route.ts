import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getListingContact } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const NOTIFY_EMAIL = "neil@anytime-soccer.com";

const TYPE_LABELS: Record<string, string> = {
  club: "Club", team: "Team", trainer: "Trainer", camp: "Camp",
  guest: "Guest Play Opportunity", tournament: "Tournament", futsal: "Futsal Team",
};

const TYPE_PATHS: Record<string, string> = {
  club: "clubs", team: "teams", trainer: "trainers", camp: "camps",
  guest: "guest-play", tournament: "tournaments", futsal: "futsal",
};

export async function POST(req: Request) {
  try {
    const { type, slug, senderName, senderEmail, message } = await req.json();

    if (!type || !slug || !senderName || !senderEmail || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const listing = await getListingContact(type, slug);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const label = TYPE_LABELS[type] || type;
    const listingUrl = `https://www.soccer-near-me.com/${TYPE_PATHS[type] || type}/${slug}`;

    if (resend) {
      const recipients = [NOTIFY_EMAIL];
      if (listing.email && listing.email !== NOTIFY_EMAIL) {
        recipients.push(listing.email);
      }

      await resend.emails.send({
        from: "SoccerFinder <notifications@soccer-near-me.com>",
        to: recipients,
        replyTo: senderEmail,
        subject: `New inquiry for ${listing.name} (${label})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #1a365d;">New Contact Inquiry</h2>
            <p style="color: #666;">Someone is interested in your ${label.toLowerCase()} listing on SoccerFinder.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 0; color: #666; width: 120px;">Listing</td><td style="padding: 8px 0; font-weight: bold;">${listing.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">From</td><td style="padding: 8px 0; font-weight: bold;">${senderName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${senderEmail}">${senderEmail}</a></td></tr>
            </table>
            <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <a href="${listingUrl}" style="display: inline-block; padding: 12px 24px; background: #DC373E; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">View Listing</a>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
