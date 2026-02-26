import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const NOTIFY_EMAIL = "neil@anytime-soccer.com";

const TYPE_LABELS: Record<string, string> = {
  club: "Club",
  team: "Team",
  trainer: "Trainer",
  camp: "Camp",
  guest: "Guest Play Opportunity",
  tournament: "Tournament",
  futsal: "Futsal Team",
  trip: "International Trip",
  marketplace: "Shop Item",
  equipment: "Equipment",
  books: "Books",
  showcase: "College Showcase",
  player: "Player Profile",
};

// ── Email notification ──────────────────────────────────────

export async function notifyNewListing(type: string, data: Record<string, string>, slug: string) {
  const label = TYPE_LABELS[type] || type;
  const name = data.name || data.teamName || data.playerName || data.title || "Unknown";
  const city = data.city || "";
  const state = data.state || "";
  const email = data.email || data.contactEmail || "";
  const phone = data.phone || "";
  const description = data.description || "";
  const listingUrl = `https://www.soccer-near-me.com/${typeToPath(type)}/${slug}`;

  // Send email via Resend
  if (resend) {
    try {
      await resend.emails.send({
        from: "Soccer Near Me <notifications@soccer-near-me.com>",
        to: NOTIFY_EMAIL,
        subject: `⏳ New ${label} Needs Approval: ${name} — ${city}, ${state}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;">
              <strong style="color: #92400E;">Action Required:</strong>
              <span style="color: #92400E;"> This listing is pending approval.</span>
            </div>
            <h2 style="color: #1a365d;">New ${label} Listed on Soccer Near Me</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 0; color: #666; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: bold;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Type</td><td style="padding: 8px 0;">${label}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Location</td><td style="padding: 8px 0;">${city}, ${state}</td></tr>
              ${email ? `<tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>` : ""}
              ${phone ? `<tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>` : ""}
            </table>
            ${description ? `<p style="color: #444; line-height: 1.6;">${description.substring(0, 300)}${description.length > 300 ? "..." : ""}</p>` : ""}
            <div style="margin-top: 16px; display: flex; gap: 12px;">
              <a href="${listingUrl}" style="display: inline-block; padding: 12px 24px; background: #DC373E; color: white; text-decoration: none; border-radius: 8px;">View Listing</a>
              <a href="https://www.soccer-near-me.com/admin" style="display: inline-block; padding: 12px 24px; background: #1a365d; color: white; text-decoration: none; border-radius: 8px;">Go to Admin Panel</a>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send notification email:", err);
    }
  }

  // Send to GoHighLevel
  await sendToGHL(type, data, slug);
}

// ── GoHighLevel integration ─────────────────────────────────

async function sendToGHL(type: string, data: Record<string, string>, slug: string) {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) return;

  const label = TYPE_LABELS[type] || type;
  const name = data.name || data.teamName || data.playerName || data.title || "Unknown";
  const email = data.email || data.contactEmail || "";
  const phone = data.phone || "";
  const city = data.city || "";
  const state = data.state || "";
  const listingUrl = `https://www.soccer-near-me.com/${typeToPath(type)}/${slug}`;

  try {
    // Create or update contact in GHL
    const res = await fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Version": "2021-07-28",
      },
      body: JSON.stringify({
        locationId,
        name,
        email: email || undefined,
        phone: phone || undefined,
        city,
        state,
        tags: [`soccernearme`, `listing-${type}`],
        source: "Soccer Near Me",
        customFields: [
          { key: "listing_type", field_value: label },
          { key: "listing_url", field_value: listingUrl },
          { key: "listing_name", field_value: name },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("GHL API error:", res.status, err);
    }
  } catch (err) {
    console.error("Failed to send to GHL:", err);
  }
}

function typeToPath(type: string): string {
  const paths: Record<string, string> = {
    club: "clubs",
    team: "teams",
    trainer: "trainers",
    camp: "camps",
    guest: "guest-play",
    tournament: "tournaments",
    futsal: "futsal",
    trip: "international-trips",
    marketplace: "shop",
    equipment: "shop",
    books: "shop",
    showcase: "camps",
    player: "guest-play/players",
  };
  return paths[type] || type;
}
