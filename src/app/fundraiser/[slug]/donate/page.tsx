"use client";

import { useState, useCallback, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useParams } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

export default function DonatePage() {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState<"form" | "checkout" | "success" | "error">("form");
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [onBehalfOf, setOnBehalfOf] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");

  const presetAmounts = [10, 25, 50, 100];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cents = Math.round(Number(amount) * 100);
    if (!cents || cents < 500 || cents > 50000) {
      setError("Please enter an amount between $5 and $500");
      return;
    }
    if (!donorName.trim() || !donorEmail.trim()) {
      setError("Name and email are required");
      return;
    }

    try {
      const res = await fetch(`/api/fundraiser/${slug}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), donorName, donorEmail, donorMessage, onBehalfOf }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout");
      setClientSecret(data.clientSecret);
      setStep("checkout");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  // Check for return from Stripe
  const checkStatus = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    const res = await fetch(`/api/fundraiser/${slug}/donate?session_id=${sessionId}`);
    const data = await res.json();
    if (data.paymentStatus === "paid") {
      setStep("success");
    }
  }, [slug]);

  useEffect(() => { checkStatus(); }, [checkStatus]);

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-2">Thank You!</h1>
        <p className="text-muted mb-6">Your donation has been received. You are making a difference!</p>
        <a href={`/fundraiser/${slug}`} className="inline-block px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-colors">
          Back to Fundraiser
        </a>
      </div>
    );
  }

  if (step === "checkout" && clientSecret) {
    return (
      <div className="max-w-lg mx-auto px-6 py-10">
        <a href={`/fundraiser/${slug}`} className="text-sm text-muted hover:text-primary transition-colors mb-4 inline-block">&larr; Back to fundraiser</a>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mb-6">Complete Your Donation</h1>
        <div id="checkout">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <a href={`/fundraiser/${slug}`} className="text-sm text-muted hover:text-primary transition-colors mb-4 inline-block">&larr; Back to fundraiser</a>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-2">Make a Donation</h1>
      <p className="text-sm text-muted mb-6">Your support makes a difference. Choose an amount below.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preset amounts */}
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <div className="flex gap-2 mb-2">
            {presetAmounts.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                  amount === String(a)
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-white text-primary hover:border-accent/50"
                }`}
              >
                ${a}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">$</span>
            <input
              type="number"
              min="5"
              max="500"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Custom amount"
              className={`${inputClass} pl-8`}
            />
          </div>
          <p className="text-xs text-muted mt-1">Min $5, Max $500</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Your Name *</label>
          <input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} className={inputClass} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Your Email *</label>
          <input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} className={inputClass} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">On Behalf Of (optional)</label>
          <input type="text" value={onBehalfOf} onChange={(e) => setOnBehalfOf(e.target.value)} placeholder="e.g. Jane Smith" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message (optional)</label>
          <textarea value={donorMessage} onChange={(e) => setDonorMessage(e.target.value)} rows={3} placeholder="Leave an encouraging message..." className={inputClass} />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#DC373E] text-white font-bold text-lg hover:bg-[#C42F36] transition-colors"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
}
