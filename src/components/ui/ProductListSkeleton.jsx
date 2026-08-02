"use client";

export default function ProductListSkeleton({ count = 6, className = "" }) {
  return (
    <div
      className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`.trim()}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
        >
          <div className="h-62 animate-pulse bg-white/10" />
          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
              <div className="h-5 w-full animate-pulse rounded bg-white/10" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-7 w-24 animate-pulse rounded bg-[#F5A623]/20" />
                <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
              </div>
              <div className="h-8 w-20 animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="h-11 animate-pulse rounded-2xl bg-[#F5A623]/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
