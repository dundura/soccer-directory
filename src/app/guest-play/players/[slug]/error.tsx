"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="bg-white rounded-2xl p-10 shadow-sm max-w-lg mx-auto border border-border">
        <div className="text-4xl mb-4">&#9917;</div>
        <h2 className="text-2xl font-extrabold text-primary mb-3">
          Something went wrong
        </h2>
        <p className="text-muted mb-6">
          We had trouble loading this player profile. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent-hover transition-colors"
        >
          Try Again
        </button>
        <div className="mt-4">
          <a
            href="/guest-play/players"
            className="text-sm text-muted hover:underline"
          >
            &larr; Back to all players
          </a>
        </div>
      </div>
    </div>
  );
}
