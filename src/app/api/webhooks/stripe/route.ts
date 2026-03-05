import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { completeDonation, getFundraiserBySlug } from "@/lib/db";
import type Stripe from "stripe";

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
      // Send notification email (non-blocking)
      try {
        const fundraiserRows = await import("@/lib/db").then(m =>
          m.getFundraiserBySlug("").then(() => null).catch(() => null)
        );
        void fundraiserRows;
        // Future: send email notification to fundraiser owner via Resend
      } catch {
        // Non-blocking
      }
    }
  }

  return NextResponse.json({ received: true });
}
