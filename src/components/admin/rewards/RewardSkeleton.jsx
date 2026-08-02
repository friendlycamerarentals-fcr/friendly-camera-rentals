"use client";

export default function RewardSkeleton({ rows = 8 }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F10]">
      {/* Header */}
      <div className="grid grid-cols-9 gap-4 border-b border-white/10 bg-white/[0.02] px-6 py-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-white/10" />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-9 items-center gap-4 px-6 py-5"
          >
            {/* Serial Number */}
            <div className="h-4 w-8 animate-pulse rounded bg-white/10" />

            {/* Customer */}
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
            </div>

            {/* Contact */}
            <div className="h-4 w-28 animate-pulse rounded bg-white/10" />

            {/* Customer ID */}
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />

            {/* Rent Date */}
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />

            {/* Reward */}
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-[#F5A623]/20" />
              <div className="h-3 w-14 animate-pulse rounded bg-white/5" />
            </div>

            {/* Expiry */}
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />

            {/* Status */}
            <div className="flex justify-center">
              <div className="h-8 w-20 animate-pulse rounded-full bg-[#F5A623]/20" />
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-2">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-white/10" />
              <div className="h-9 w-9 animate-pulse rounded-xl bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
