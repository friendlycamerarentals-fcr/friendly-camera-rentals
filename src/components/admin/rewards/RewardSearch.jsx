"use client";

import { Search, RotateCcw } from "lucide-react";

export default function RewardSearch({ search, setSearch, status, setStatus }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}
      <div className="relative w-full lg:max-w-xl">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Reward ID, Customer Name, Customer ID or Contact..."
          className="h-12 w-full rounded-2xl border border-white/10 bg-[#111111] pl-12 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-500 focus:border-[#F5A623]"
        />
      </div>

      {/* Right Side */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-12 rounded-2xl border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-[#F5A623]"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Used">Used</option>
          <option value="Expired">Expired</option>
        </select>

        {/* Reset */}
        <button
          onClick={() => {
            setSearch("");
            setStatus("All");
          }}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/10 px-5 text-sm font-medium text-[#F5A623] transition hover:bg-[#F5A623] hover:text-black"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
}
