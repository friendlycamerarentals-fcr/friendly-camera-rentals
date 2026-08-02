import RewardSkeleton from "@/components/admin/rewards/RewardSkeleton";

export default function Loading() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 animate-pulse rounded-2xl bg-[#F5A623]/10" />

        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-72 animate-pulse rounded bg-white/5" />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-white/10 bg-[#111111] p-6"
          >
            <div className="h-5 w-28 animate-pulse rounded bg-white/10" />

            <div className="mt-5 h-10 w-20 animate-pulse rounded bg-[#F5A623]/20" />

            <div className="mt-5 h-3 w-full animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="h-12 w-full animate-pulse rounded-2xl bg-[#111111] lg:max-w-xl" />

        <div className="flex gap-3">
          <div className="h-12 w-40 animate-pulse rounded-2xl bg-[#111111]" />
          <div className="h-12 w-32 animate-pulse rounded-2xl bg-[#F5A623]/20" />
        </div>
      </div>

      {/* Table */}
      <RewardSkeleton rows={10} />
    </div>
  );
}
