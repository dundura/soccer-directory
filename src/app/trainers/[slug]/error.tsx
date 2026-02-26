"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-16 text-center">
      <div className="bg-white rounded-2xl p-10 shadow-sm max-w-lg mx-auto">
        <div className="text-4xl mb-4">&#9917;</div>
        <h2 className="text-2xl font-extrabold text-primary mb-3">
          Something went wrong
        </h2>
        <p className="text-muted mb-6">
          We had trouble loading this trainer profile. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
        <div className="mt-4">
          <a href="/trainers" className="text-sm text-muted hover:underline">
            &larr; Back to all trainers
          </a>
        </div>
      </div>
    </div>
  );
}
