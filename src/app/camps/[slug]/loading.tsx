export default function Loading() {
  return (
    <>
      {/* Breadcrumb skeleton */}
      <div className="max-w-[1100px] mx-auto px-6 py-3.5">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">

          {/* Sidebar */}
          <aside className="flex flex-col gap-4 order-2 lg:order-1">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="w-full h-[200px] bg-gray-200 animate-pulse" />
              <div className="text-center py-3.5 px-4 space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
              </div>
              <div className="flex items-center justify-center px-4 py-2.5 border-t border-border">
                <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex justify-between items-center px-4 py-[11px] border-b border-border last:border-b-0">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-2.5" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex flex-col gap-5 order-1 lg:order-2">
            {/* Hero */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="w-full h-[220px] bg-gray-200 animate-pulse" />
              <div className="p-7 flex gap-6 items-start">
                <div className="w-[72px] h-[72px] rounded-xl bg-gray-200 animate-pulse shrink-0 -mt-16 relative z-10" />
                <div className="flex-1 space-y-3">
                  <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="flex gap-2.5 mt-[18px]">
                    <div className="h-11 w-28 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* At a Glance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-3.5" />
              <div className="grid grid-cols-2 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>

            {/* Photos & Video */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-3.5" />
              <div className="grid grid-cols-2 gap-2.5">
                <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
