export default function Loading() {
  return (
    <>
      {/* Hero Banner skeleton */}
      <div className="relative">
        <div className="h-48 md:h-64 bg-primary" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-6">
            <div className="h-4 w-24 bg-white/20 rounded animate-pulse mb-4" />
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 w-16 bg-white/20 rounded-full animate-pulse" />
              ))}
            </div>
            <div className="h-9 w-64 bg-white/20 rounded animate-pulse mb-2" />
            <div className="h-5 w-48 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="w-full aspect-square bg-gray-200 animate-pulse" />
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
                <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Looking For */}
            <div className="bg-white rounded-2xl border-2 border-accent/20 p-6 md:p-8">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Player Details */}
            <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights placeholder */}
            <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <div className="h-6 w-28 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="w-full aspect-video bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
