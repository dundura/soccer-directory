"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SitePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("snm-popup-dismissed")) return;
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("snm-popup-dismissed", "1");
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={dismiss}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.3)] max-w-[820px] w-full overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xl font-bold transition-colors cursor-pointer"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Left - Image (hidden on mobile) */}
        <div className="hidden md:flex md:w-[45%] items-center justify-center overflow-hidden">
          <img
            src="https://media.anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp"
            alt="Soccer Near Me"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right - Content */}
        <div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col justify-center">
          <p className="text-accent text-xs font-bold uppercase tracking-[2px] mb-2">
            Free Listing
          </p>
          <p className="text-accent text-sm font-semibold mb-4">
            Get Found by Players & Families in Your Area!
          </p>
          <div className="w-12 h-[3px] bg-accent rounded-full mb-5" />
          <h2 className="text-2xl md:text-[28px] font-extrabold text-primary leading-tight mb-2">
            List Your Club, Team, or Camp for Free.
          </h2>
          <p className="text-muted text-[15px] mb-4">
            Thousands of players and parents search Soccer Near Me every month to find local soccer opportunities.
          </p>
          <p className="text-primary font-bold text-[15px] mb-1">
            Get <span className="text-accent">more visibility</span> for your program today.
          </p>
          <p className="text-muted text-sm mb-6">
            It takes less than 2 minutes. No cost. No catch.
          </p>
          <Link
            href="/list"
            onClick={dismiss}
            className="bg-accent hover:bg-accent-hover text-white text-center px-6 py-4 rounded-full font-bold text-base transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(220,55,62,0.35)] hover:shadow-[0_6px_25px_rgba(220,55,62,0.45)]"
          >
            List My Program for Free &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
