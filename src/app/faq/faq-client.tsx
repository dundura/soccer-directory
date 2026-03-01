"use client";

import { useState } from "react";

type FAQItem = { question: string; href: string };
type FAQCategory = { title: string; icon: string; items: FAQItem[] };

const FAQ_DATA: FAQCategory[] = [
  {
    title: "Getting Started",
    icon: "🚀",
    items: [
      { question: "Welcome to Anytime Soccer Training: Your First Steps", href: "https://anytime-soccer.com/how-to-get-started-with-anytime-soccer-training-a-quick-guide-for-parents-and-players/" },
      { question: "Quick Start Guide for Parents and Players", href: "https://anytime-soccer.com/quick-start-guide-for-parents-and-players/" },
      { question: "Introducing Anytime Soccer Training", href: "https://anytime-soccer.com/introducing-anytime-soccer-training" },
      { question: "Getting to Know Anytime Soccer Training", href: "https://anytime-soccer.com/getting-to-know-anytime-soccer-training" },
      { question: "Start Training With Anytime Soccer Training", href: "https://anytime-soccer.com/start-training-with-anytime-soccer-training" },
      { question: "Your First Month With Anytime Soccer Training", href: "https://anytime-soccer.com/your-first-month-with-anytime-soccer-training" },
      { question: "Answering the Top 6 Questions About Starting Anytime Soccer Training", href: "https://anytime-soccer.com/6-most-common-questions-answered/" },
      { question: "Answers to Frequently Asked Questions", href: "https://anytime-soccer.com/frequently-asked-questions/" },
    ],
  },
  {
    title: "Teams & Coaches",
    icon: "⚽",
    items: [
      { question: "Getting Your Team Started with Anytime Soccer Training", href: "https://anytime-soccer.com/getting-started-with-anytime-soccer-training-3/" },
      { question: "Coaches Getting Started With Anytime Soccer Training", href: "https://anytime-soccer.com/coaches-getting-started-with-anytime-soccer-training" },
      { question: "Creating a Team with Anytime Soccer Training", href: "https://anytime-soccer.com/learn-how-to-create-a-team-with-anytime-soccer-training" },
      { question: "Joining a Team In Anytime Soccer Training", href: "https://anytime-soccer.com/learn-how-to-join-a-team-in-anytime-soccer-training/" },
      { question: "Requesting to Join a Team On Anytime Soccer Training", href: "https://anytime-soccer.com/request-to-join-team-on-anytime-soccer-training/" },
      { question: "Accepting a Team Invitation on Anytime Soccer Training", href: "https://anytime-soccer.com/accepting-a-team-invitation-on-anytime-soccer-training/" },
      { question: "Apply a Team Code to an Existing Account", href: "https://anytime-soccer.com/apply-a-team-code-to-an-existing-account/" },
      { question: "Applying a Team Code to New and Existing Accounts", href: "https://anytime-soccer.com/applying-a-team-code-to-new-and-existing-accounts/" },
    ],
  },
  {
    title: "Training & Homework",
    icon: "📋",
    items: [
      { question: "Getting Started with Anytime Soccer Training Homework", href: "https://anytime-soccer.com/getting-started-with-anytime-soccer-training-homework/" },
      { question: "How Coaches Can Assign Homework in Anytime Soccer Training", href: "https://anytime-soccer.com/how-coaches-can-assign-homework-in-anytime-soccer-training/" },
      { question: "How to Use the Next Up Folder for Soccer Training Homework", href: "https://anytime-soccer.com/how-to-use-the-next-up-folder-in-anytime-soccer-training/" },
      { question: "How to Use Weekly Soccer Training Plans to Stay Organized", href: "https://anytime-soccer.com/how-to-use-weekly-plans-to-stay-organized-and-get-better-faster/" },
      { question: "Getting Started: First Homework for Your Team", href: "https://anytime-soccer.com/getting-started-first-homework-for-your-team" },
      { question: "5 Soccer Homework Sessions for 2014 Players", href: "https://anytime-soccer.com/5-tailored-soccer-homework-sessions-for-pre-academy-players-a-guide-for-coaches/" },
      { question: "How to Motivate Kids to Train at Home (and Make It Fun with Team Contests)", href: "https://anytime-soccer.com/how-to-motivate-kids-to-train-at-home-and-make-it-fun-with-team-contests/" },
    ],
  },
  {
    title: "Account & Settings",
    icon: "⚙️",
    items: [
      { question: "Updating Your Screen Name on Anytime Soccer Training", href: "https://anytime-soccer.com/updating-your-screen-name/" },
      { question: "Anytime Soccer Training Account Management Tips", href: "https://anytime-soccer.com/account-management-tips/" },
      { question: "Understanding Parent/Coach & Player Account Roles", href: "https://anytime-soccer.com/understanding-parent-player-account-roles/" },
    ],
  },
  {
    title: "Tips & Guides",
    icon: "💡",
    items: [
      { question: "Simple Soccer Training Tips for Busy Parents", href: "https://anytime-soccer.com/simple-soccer-training-tips-for-busy-parents-and-how-anytime-soccer-training-makes-it-easier/" },
      { question: "6 Tips on Using Anytime Soccer Training", href: "https://anytime-soccer.com/6-tips-on-using-anytime-soccer-training" },
      { question: "Learn How Anytime Soccer Training's Video Format Improves Player Development", href: "https://anytime-soccer.com/learn-how-anytime-soccer-trainings-video-format-improves-player-development" },
    ],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg className="w-4 h-4 text-muted group-hover:text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

export function FAQPage() {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

  const toggle = (index: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Everything you need to know about getting started with Anytime Soccer Training — for parents, players, and coaches.
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="text-center p-4 bg-surface rounded-xl">
              <div className="font-[family-name:var(--font-display)] text-2xl font-bold text-accent">29</div>
              <div className="text-muted text-sm mt-1">Help Articles</div>
            </div>
            <div className="text-center p-4 bg-surface rounded-xl">
              <div className="font-[family-name:var(--font-display)] text-2xl font-bold text-accent">5</div>
              <div className="text-muted text-sm mt-1">Categories</div>
            </div>
            <div className="text-center p-4 bg-surface rounded-xl">
              <div className="font-[family-name:var(--font-display)] text-2xl font-bold text-accent">24/7</div>
              <div className="text-muted text-sm mt-1">Available</div>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="space-y-4">
            {FAQ_DATA.map((category, i) => {
              const isOpen = openSections.has(i);
              return (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between p-5 bg-white hover:bg-surface/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <div>
                        <h2 className="font-[family-name:var(--font-display)] font-bold text-lg">{category.title}</h2>
                        <span className="text-muted text-sm">{category.items.length} articles</span>
                      </div>
                    </div>
                    <ChevronIcon open={isOpen} />
                  </button>

                  {isOpen && (
                    <div className="border-t border-border">
                      {category.items.map((item, j) => (
                        <a
                          key={j}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition-colors border-b border-border last:border-b-0"
                        >
                          <span className="text-sm font-medium group-hover:text-accent transition-colors pr-4">
                            {item.question}
                          </span>
                          <ExternalIcon />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-surface rounded-2xl text-center">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-xl mb-2">Still have questions?</h3>
            <p className="text-muted mb-6">Can&apos;t find what you&apos;re looking for? Reach out to the Anytime Soccer Training team.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://anytime-soccer.com/contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-hover transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/blog"
                className="inline-flex items-center justify-center gap-2 bg-white border border-border text-primary px-6 py-3 rounded-lg font-semibold hover:shadow-md transition-all"
              >
                Read the Blog
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
