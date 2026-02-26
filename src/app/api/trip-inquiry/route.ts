import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getListingContact } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const NOTIFY_EMAIL = "neil@anytime-soccer.com";

export async function POST(req: Request) {
  try {
    const { slug, tripName, destination, parentName, playerName, email, phone, playerAge, message, website, _t } = await req.json();

    if (website) return NextResponse.json({ success: true });
    if (_t && Date.now() - _t < 3000) return NextResponse.json({ success: true });

    if (!slug || !parentName || !playerName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const listing = await getListingContact("trip", slug);
    const listingUrl = `https://www.soccer-near-me.com/international-trips/${slug}`;

    if (resend) {
      const recipients = [NOTIFY_EMAIL];
      if (listing?.email && listing.email !== NOTIFY_EMAIL) {
        recipients.push(listing.email);
      }

      await resend.emails.send({
        from: "Soccer Near Me <notifications@soccer-near-me.com>",
        to: recipients,
        replyTo: email,
        subject: `Trip Inquiry: ${playerName} for ${tripName} — ${destination}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #1a365d;">International Trip Inquiry</h2>
            <p style="color: #666;">A player has expressed interest in your trip to <strong>${destination}</strong>.</p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 0; color: #666; width: 140px;">Trip</td><td style="padding: 8px 0; font-weight: bold;">${tripName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Destination</td><td style="padding: 8px 0;">${destination}</td></tr>
              <tr style="border-top: 1px solid #eee;"><td style="padding: 8px 0; color: #666;">Parent / Guardian</td><td style="padding: 8px 0; font-weight: bold;">${parentName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Player Name</td><td style="padding: 8px 0; font-weight: bold;">${playerName}</td></tr>
              ${playerAge ? `<tr><td style="padding: 8px 0; color: #666;">Player Age</td><td style="padding: 8px 0;">${playerAge}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>` : ""}
            </table>

            ${message ? `<div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p></div>` : ""}

            <a href="${listingUrl}" style="display: inline-block; padding: 12px 24px; background: #DC373E; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">View Listing</a>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
  }
}
