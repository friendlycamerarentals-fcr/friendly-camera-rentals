"use client";

import { Search, RotateCcw } from "lucide-react";

const FILTERS = ["All", "Active", "Applied", "Used", "Expired"];

export default function RewardFilters({
  search,
  setSearch,
  status,
  setStatus,
  onRefresh,
  total = 0,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            type="text"
            placeholder="Search Reward ID, Customer ID, Name, Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-2xl border border-white/10 bg-black/40 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-[#F5A623] lg:h-12"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all md:px-4 md:py-2 md:text-sm ${
                status === item
                  ? "bg-[#F5A623] text-black"
                  : "border border-white/10 bg-zinc-900 text-zinc-400 hover:border-[#F5A623]/40 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-zinc-500 sm:text-sm">
          Showing <span className="font-semibold text-white">{total}</span>{" "}
          reward records
        </p>

        <button
          onClick={onRefresh}
          className="flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-zinc-300 transition-all hover:border-[#F5A623]/30 hover:text-[#F5A623] md:px-4"
        >
          <RotateCcw size={16} />
          Refresh
        </button>
      </div>
    </div>
  );
}
