import type { Metadata } from "next";
import { AnytimeInlineCTA } from "@/components/ui";

export const metadata: Metadata = {
  title: "How to Create Your Listing | Soccer Near Me",
  description:
    "Create a free listing on Soccer Near Me and get found by families in your area. Learn how to set up your profile and start getting contact requests today.",
};

const STEPS = [
  {
    n: 1,
    title: "Create a Free Account",
    body: "Sign up at soccer-near-me.com/dashboard using your Google account. It takes about 10 seconds.",
  },
  {
    n: 2,
    title: "Choose Your Listing Type",
    body: "Select the category that best fits your program — club, team, trainer, camp, tournament, futsal, guest play, podcast, blog, training app, Facebook group, or product/service.",
  },
  {
    n: 3,
    title: "Fill Out Your Profile",
    body: "Add your program name, location, description, contact information, photos, videos, and social media links. The more detail you provide, the better your listing will perform.",
  },
  {
    n: 4,
    title: "Submit for Approval",
    body: "Once submitted, our team reviews your listing to make sure everything looks good. Most listings are approved within 24 hours.",
  },
  {
    n: 5,
    title: "Start Getting Found",
    body: "Your listing goes live and becomes searchable by families in your area. You will receive contact requests directly to your email.",
  },
];

export default function GetListedPage() {
  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="bg-primary text-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-accent/20 text-accent text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            It&apos;s Free
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            How to Create Your Listing
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Get your program in front of thousands of soccer families — completely free. Takes less than 5 minutes to set up.
          </p>
          <a
            href="/dashboard"
            className="inline-block mt-8 bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors"
          >
            Create Your Free Listing
          </a>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          {STEPS.map((step) => (
            <div key={step.n} className="bg-white rounded-2xl border border-border p-7 sm:p-8 shadow-sm flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 text-accent font-bold text-xl flex items-center justify-center mt-0.5">
                {step.n}
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary mb-2">
                  {step.title}
                </h2>
                <p className="text-muted leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tip */}
        <div className="mt-8 bg-accent/5 border border-accent/20 rounded-2xl p-7">
          <p className="font-[family-name:var(--font-display)] font-bold text-primary mb-2">
            💡 Pro Tip
          </p>
          <p className="text-muted leading-relaxed">
            Listings with photos, a detailed description, and social media links get significantly more engagement. Take the time to fill out every field — it makes a difference.
          </p>
        </div>
      </section>

      {/* We Spread the Word */}
      <section className="bg-white border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-primary text-center mb-4">
            We Spread the Word For You
          </h2>
          <p className="text-muted text-center text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Creating a listing doesn&apos;t just put you on the directory — it gets you in front of our audience too.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-surface rounded-xl p-6 border border-border">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-primary mb-2">
                Shared in Our Facebook Group
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                New and featured listings are shared directly to our Soccer Near Me Facebook community — thousands of parents and coaches who are actively looking for programs like yours.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-6 border border-border">
              <div className="text-3xl mb-3">📰</div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-primary mb-2">
                Featured in Our Newsletter
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                We send a regular newsletter to our subscriber list. New listings and standout programs get included — bringing you direct traffic from families who want exactly what you offer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-3">
            ⭐ Featured Listings
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Want extra visibility? Featured listings appear at the top of search results and on the homepage with a special badge. Our team selects standout programs to feature, and we will notify you by email if your listing gets chosen.
          </p>
          <p className="text-muted leading-relaxed">
            <strong className="text-primary">There is no cost to be featured.</strong> We highlight programs that have complete profiles, strong community engagement, and positive reviews.
          </p>
        </div>
      </section>

      {/* Reviews & Contact Forms */}
      <section className="bg-white border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-3">
              Reviews
            </h2>
            <p className="text-muted leading-relaxed mb-3">
              Families can leave reviews on any listing to share their experience. Reviews help other parents make informed decisions and help great programs stand out.
            </p>
            <p className="text-muted leading-relaxed">
              All reviews go through a moderation process before they are published. Listing owners receive an email when a new review is submitted and can respond directly on their listing page.
            </p>
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-3">
              Contact Forms
            </h2>
            <p className="text-muted leading-relaxed">
              Every listing includes a built-in contact form. When a parent or player submits a message, it goes directly to the email address on file for that listing. You also get a copy at your registered account email so nothing gets missed.
            </p>
          </div>
        </div>
      </section>

      {/* Who Built This */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-3">
            Who Built This
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Soccer Near Me was created by the team behind{" "}
            <a href="https://anytime-soccer.com" target="_blank" rel="noopener" className="text-accent hover:underline font-medium">
              Anytime Soccer Training
            </a>{" "}
            — a platform with over 5,000 follow-along training videos used by more than 100,000 soccer families worldwide.
          </p>
          <p className="text-muted leading-relaxed">
            We built Soccer Near Me because we saw how hard it was for parents to find the right club, coach, or training opportunity. There was no single place to search and compare. So we built one.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Whether you are searching for a program or listing your own — it is free, fast, and built for the soccer community.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors"
          >
            Create Your Free Listing
          </a>
          <p className="text-white/50 text-sm mt-4">No credit card. No catch. Takes less than 5 minutes.</p>
        </div>
      </section>

      {/* Anytime CTA */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnytimeInlineCTA />
      </div>
    </div>
  );
}
