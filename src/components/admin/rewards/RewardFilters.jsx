"use client";

import { Search, RotateCcw } from "lucide-react";

const FILTERS = [
  "All",
  "Active",
  "Applied",
  "Used",
  "Expired",
];

export default function RewardFilters({
  search,
  setSearch,
  status,
  setStatus,
  onRefresh,
  total = 0,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            type="text"
            placeholder="Search Reward ID, Customer ID, Name, Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 pl-12 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-[#F5A623]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
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

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
        <p className="text-sm text-zinc-500">
          Showing <span className="font-semibold text-white">{total}</span>{" "}
          reward records
        </p>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition-all hover:border-[#F5A623]/30 hover:text-[#F5A623]"
        >
          <RotateCcw size={16} />
          Refresh
        </button>
      </div>
    </div>
  );
}