import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getFundraiserBySlug, createDonation } from "@/lib/db";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);
  if (!fundraiser) return NextResponse.json({ error: "Fundraiser not found" }, { status: 404 });
  if (!fundraiser.active) return NextResponse.json({ error: "This fundraiser is no longer accepting donations" }, { status: 400 });

  const { amount, donorName, donorEmail, donorMessage, onBehalfOf } = await req.json();
  const cents = Math.round(Number(amount) * 100);
  if (!cents || cents < 500 || cents > 50000) {
    return NextResponse.json({ error: "Amount must be between $5 and $500" }, { status: 400 });
  }
  if (!donorName || !donorEmail) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const platformFee = Math.round(cents * 0.1);
  const netAmount = cents - platformFee;

  const session = await getStripe().checkout.sessions.create({
    ui_mode: "embedded",
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: {
          name: `Donation to ${fundraiser.title}`,
          description: onBehalfOf ? `On behalf of ${onBehalfOf}` : undefined,
        },
        unit_amount: cents,
      },
      quantity: 1,
    }],
    customer_email: donorEmail,
    metadata: {
      type: "team_donation",
      fundraiser_id: fundraiser.id,
      donor_name: donorName,
      donor_email: donorEmail,
    },
    return_url: `${process.env.NEXTAUTH_URL || "https://www.soccer-near-me.com"}/fundraiser/${slug}/donate?session_id={CHECKOUT_SESSION_ID}`,
  });

  await createDonation({
    fundraiserId: fundraiser.id,
    donorName,
    donorEmail,
    amount: cents,
    platformFee,
    netAmount,
    stripeSessionId: session.id,
    donorMessage: donorMessage || undefined,
    onBehalfOf: onBehalfOf || undefined,
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  return NextResponse.json({
    status: session.status,
    paymentStatus: session.payment_status,
    donorName: session.metadata?.donor_name,
    amount: session.amount_total,
  });
}
