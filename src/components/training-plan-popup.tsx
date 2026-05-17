"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ast_plan_popup_dismissed";
const DISMISS_DAYS = 7;

export default function TrainingPlanPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={dismiss}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative">
          <img
            src="https://d2vm0l3c6tu9qp.cloudfront.net/soccer-directory/uploads/1778974402995-sa4a36.png"
            alt="Free Soccer Training Plan"
            className="w-full object-cover"
            style={{ maxHeight: "200px", objectPosition: "center top" }}
          />
          <button
            onClick={dismiss}
            className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-sm transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-red-600 mb-1">Free — no account needed</div>
          <h3 className="text-lg font-black text-gray-900 leading-tight mb-2">
            Stop Guessing.<br />Start Training.
          </h3>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Build a personalized soccer training plan for your player in 60 seconds. Get a free PDF emailed instantly.
          </p>
          <a
            href="https://www.anytime-soccer.com/free-training-plan"
            className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors"
            onClick={dismiss}
          >
            Build My Free Plan →
          </a>
          <button
            onClick={dismiss}
            className="block w-full text-center text-gray-400 text-xs mt-3 hover:text-gray-600 transition-colors"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
