export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-72 shrink-0 space-y-5">
          <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="w-full aspect-square bg-surface animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-sm p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-surface rounded animate-pulse" />
            ))}
          </div>
          <div className="h-12 bg-surface rounded-xl animate-pulse" />
        </aside>
        <div className="flex-1 min-w-0 space-y-6">
          <div className="h-48 md:h-64 bg-surface rounded-2xl animate-pulse" />
          <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
            <div className="h-5 w-24 bg-surface rounded animate-pulse" />
            <div className="h-4 bg-surface rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-surface rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
