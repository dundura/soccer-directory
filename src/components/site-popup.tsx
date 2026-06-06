"use client";

import { useState, useEffect } from "react";

const FREE_EBOOKS = [
  { title: "The Most Important Skill Never Taught", subtitle: "This powerful (yet simple) tip will change your child's game forever.", href: "https://anytime-soccer.com/the-most-important-skill-in-youth-soccer/", image: "https://media.anytime-soccer.com/wp-content/uploads/2021/01/ast_facebook_image_3.jpg", cta: "Download Free Ebook" },
  { title: "Must-Have Guide to In-Home Training", subtitle: "Everything you need to know to start training at home effectively.", href: "https://anytime-soccer.com/must-have-guide-for-serious-soccer-parents/", image: "https://media.anytime-soccer.com/wp-content/themes/anytime/images/home/bg-1.png", cta: "Get the Guide" },
  { title: "20 Questions for Every Club", subtitle: "Essential questions to ask before joining any youth soccer club.", href: "https://anytime-soccer.com/20-questions-every-parent-should-ask/", image: "https://media.anytime-soccer.com/wp-content/themes/anytime/images/ebook/ebook-1.png", cta: "Download Free" },
  { title: "Become a Rec Coach SuperHero", subtitle: "Transform your rec coaching with practical tips and strategies.", href: "https://anytime-soccer.com/become-a-rec-coach-superhero/", image: "https://media.anytime-soccer.com/wp-content/themes/anytime/images/ebook/ebook-2.png", cta: "Get the Playbook" },
  { title: "Everything About Guest Playing", subtitle: "Navigate guest playing opportunities like a pro.", href: "https://anytime-soccer.com/everything-you-need-to-know-about-guest-playing/", image: "https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1780779110397-5yoxm9.png", cta: "Download Free" },
  { title: "Monopoly: Issues Facing US Youth Soccer", subtitle: "A candid look at what's holding back American soccer.", href: "https://anytime-soccer.com/monopoly-addressing-issues-facing-youth-soccer-ebook/", image: "https://media.anytime-soccer.com/wp-content/uploads/2024/07/us_soccer-768x596.png", cta: "Read Free Ebook" },
  { title: "The Parent Trainer's Playbook", subtitle: "20 unconventional tips for raising a competitive soccer player.", href: "https://anytime-soccer.com/the-parent-trainers-playbook/", image: "https://media.anytime-soccer.com/wp-content/uploads/2024/08/the-playbook-20-unconventional-tips-for-raising-a-compeitive-soccer-player-thus-far-1024x789.png", cta: "Get the Playbook" },
  { title: "Player Cards Guide", subtitle: "Stay informed about eligibility requirements and avoid missed tournaments.", href: "https://anytime-soccer.com/everything-you-need-to-know-about-player-cards/", image: "https://media.anytime-soccer.com/wp-content/uploads/2024/11/pro-tips-for-college-showcases-1.png", cta: "Download Free" },
];

const IMAGE_VARIANTS = {
  listing: {
    image: "https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1780782697024-231ig8.png",
    alt: "List Your Club, Team, or Camp for Free",
    href: "/dashboard",
  },
  training: {
    image: "https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1780777965295-ngesx2.png",
    alt: "Free 7-Day Soccer Training Plan",
    href: "https://www.anytime-soccer.com/free-soccer-drills-for-kids",
  },
  "plan-builder": {
    image: "https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1780778473127-vnm6a6.png",
    alt: "Free Soccer Training Plan Builder",
    href: "https://www.anytime-soccer.com/free-training-plan",
  },
};

type Variant = "listing" | "training" | "plan-builder" | "ebook";

export default function SitePopup() {
  const [show, setShow] = useState(false);
  const [variant, setVariant] = useState<Variant>("listing");
  const [ebookIndex, setEbookIndex] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("snm-popup-dismissed")) return;
    const roll = Math.random();
    if (roll < 0.25) {
      setVariant("listing");
    } else if (roll < 0.5) {
      setVariant("training");
    } else if (roll < 0.75) {
      setVariant("plan-builder");
    } else {
      setVariant("ebook");
      setEbookIndex(Math.floor(Math.random() * FREE_EBOOKS.length));
    }
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("snm-popup-dismissed", "1");
  };

  if (!show) return null;

  const ebook = FREE_EBOOKS[ebookIndex];

  const v = variant === "ebook"
    ? { image: ebook.image, alt: ebook.title, href: ebook.href }
    : IMAGE_VARIANTS[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={dismiss}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative max-w-[580px] w-full rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xl font-bold transition-colors cursor-pointer"
          aria-label="Close"
        >
          &times;
        </button>
        <a href={v.href} target="_blank" rel="noopener noreferrer" onClick={dismiss}>
          <img src={v.image} alt={v.alt} className="w-full block" />
        </a>
      </div>
    </div>
  );
}
