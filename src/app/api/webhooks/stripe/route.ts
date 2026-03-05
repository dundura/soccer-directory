import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { completeDonation, getFundraiserById } from "@/lib/db";
import { Resend } from "resend";
import type Stripe from "stripe";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_DONATION_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.type !== "team_donation") {
      return NextResponse.json({ received: true });
    }

    const paymentIntentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || "";

    const result = await completeDonation(session.id, paymentIntentId);
    if (result) {
      // Get fundraiser info for emails
      try {
        const f = await getFundraiserById(result.fundraiserId);
        if (f) {
          const fundraiser = { title: f.title, slug: f.slug, coach_email: f.coachEmail };
          const amountStr = `$${(result.amount / 100).toFixed(2)}`;
          const fundraiserUrl = `https://www.soccer-near-me.com/fundraiser/${fundraiser.slug}`;

          // Email 1: Thank the donor
          if (resend) {
            await resend.emails.send({
              from: "Soccer Near Me <notifications@soccer-near-me.com>",
              to: [result.donorEmail],
              subject: `Thank you for your donation to ${fundraiser.title}!`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #0f1e35, #1a365d); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 48px;">&#9917;</span>
                    <h1 style="color: white; margin: 12px 0 4px; font-size: 24px;">Thank You, ${result.donorName}!</h1>
                    <p style="color: rgba(255,255,255,0.7); font-size: 16px; margin: 0;">Your generosity makes a difference</p>
                  </div>
                  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
                    <p style="margin: 0; color: #166534; font-size: 14px;">Donation Confirmed</p>
                    <p style="margin: 8px 0 0; color: #166534; font-size: 28px; font-weight: bold;">${amountStr}</p>
                  </div>
                  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr><td style="padding: 8px 0; color: #666; width: 130px;">Fundraiser</td><td style="padding: 8px 0; font-weight: bold; color: #1a365d;">${fundraiser.title}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Amount</td><td style="padding: 8px 0;">${amountStr}</td></tr>
                    ${result.onBehalfOf ? `<tr><td style="padding: 8px 0; color: #666;">On Behalf Of</td><td style="padding: 8px 0;">${result.onBehalfOf}</td></tr>` : ""}
                    ${result.donorMessage ? `<tr><td style="padding: 8px 0; color: #666;">Your Message</td><td style="padding: 8px 0; font-style: italic;">"${result.donorMessage}"</td></tr>` : ""}
                  </table>
                  <div style="text-align: center; margin: 28px 0;">
                    <a href="${fundraiserUrl}" style="display: inline-block; padding: 14px 32px; background: #DC373E; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">View Fundraiser</a>
                  </div>
                  <p style="color: #999; font-size: 12px; text-align: center; line-height: 1.6;">
                    This is a confirmation of your donation. Donations may not be tax-deductible in certain jurisdictions.<br/>
                    <a href="https://www.soccer-near-me.com/fundraiser/terms" style="color: #999;">Fundraiser Terms &amp; Conditions</a>
                  </p>
                </div>
              `,
            }).catch(err => console.error("Failed to send donor email:", err));

            // Email 2: Notify the fundraiser organizer
            if (fundraiser.coach_email) {
              await resend.emails.send({
                from: "Soccer Near Me <notifications@soccer-near-me.com>",
                to: [fundraiser.coach_email as string],
                subject: `New ${amountStr} donation to ${fundraiser.title}!`,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0f1e35, #1a365d); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
                      <span style="font-size: 48px;">&#127881;</span>
                      <h1 style="color: white; margin: 12px 0 4px; font-size: 24px;">New Donation Received!</h1>
                      <p style="color: rgba(255,255,255,0.7); font-size: 16px; margin: 0;">${fundraiser.title}</p>
                    </div>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
                      <p style="margin: 0; color: #166534; font-size: 28px; font-weight: bold;">${amountStr}</p>
                      <p style="margin: 4px 0 0; color: #166534; font-size: 14px;">from ${result.donorName}</p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                      <tr><td style="padding: 8px 0; color: #666; width: 130px;">Donor</td><td style="padding: 8px 0; font-weight: bold;">${result.donorName}</td></tr>
                      <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${result.donorEmail}" style="color: #DC373E;">${result.donorEmail}</a></td></tr>
                      <tr><td style="padding: 8px 0; color: #666;">Amount</td><td style="padding: 8px 0;">${amountStr}</td></tr>
                      ${result.onBehalfOf ? `<tr><td style="padding: 8px 0; color: #666;">On Behalf Of</td><td style="padding: 8px 0;">${result.onBehalfOf}</td></tr>` : ""}
                      ${result.donorMessage ? `<tr><td style="padding: 8px 0; color: #666;">Message</td><td style="padding: 8px 0; font-style: italic;">"${result.donorMessage}"</td></tr>` : ""}
                    </table>
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                      After Stripe processing fees and the 10% platform fee, the net proceeds will be deposited to your connected Stripe account.
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                      <a href="${fundraiserUrl}" style="display: inline-block; padding: 14px 32px; background: #DC373E; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">View Fundraiser</a>
                    </div>
                  </div>
                `,
              }).catch(err => console.error("Failed to send organizer email:", err));
            }

            // Email 3: Notify admin
            await resend.emails.send({
              from: "Soccer Near Me <notifications@soccer-near-me.com>",
              to: ["neil@anytime-soccer.com"],
              subject: `Donation: ${amountStr} to ${fundraiser.title} from ${result.donorName}`,
              html: `
                <div style="font-family: sans-serif;">
                  <h2 style="color: #1a365d;">New Donation on Soccer Near Me</h2>
                  <p><strong>Fundraiser:</strong> ${fundraiser.title}</p>
                  <p><strong>Donor:</strong> ${result.donorName} (${result.donorEmail})</p>
                  <p><strong>Amount:</strong> ${amountStr}</p>
                  ${result.onBehalfOf ? `<p><strong>On Behalf Of:</strong> ${result.onBehalfOf}</p>` : ""}
                  ${result.donorMessage ? `<p><strong>Message:</strong> "${result.donorMessage}"</p>` : ""}
                  <p><a href="${fundraiserUrl}">View Fundraiser</a></p>
                </div>
              `,
            }).catch(err => console.error("Failed to send admin email:", err));
          }
        }
      } catch (err) {
        console.error("Error sending donation emails:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
