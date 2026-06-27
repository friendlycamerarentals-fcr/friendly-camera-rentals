"use client";

import { Search, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "Pending", color: "bg-yellow-500" },
  { label: "Confirmed", value: "Confirmed", color: "bg-blue-500" },
  { label: "Picked Up", value: "Picked Up", color: "bg-purple-500" },
  { label: "Returned", value: "Returned", color: "bg-cyan-500" },
  { label: "Completed", value: "Completed", color: "bg-green-500" },
  { label: "Cancelled", value: "Cancelled", color: "bg-red-500" },
];

const timeOptions = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 24 Hours", value: "24h" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 1 Year", value: "365d" },
];

// ── Reusable dropdown ────────────────────────────────────────────────────────
function FilterDropdown({ icon: Icon, value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-black px-4 text-sm text-white transition hover:border-[#F5A623]/50"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={16} className="shrink-0 text-zinc-400" />}
          <span className="text-white">{selected?.label ?? placeholder}</span>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="p-1.5">
            {options.map((item) => {
              const isActive = value === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-all ${
                    isActive
                      ? "bg-[#F5A623]/15 text-[#F5A623]"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {/* Colour dot — only for status options */}
                  {item.color != null ? (
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${item.color}`}
                    />
                  ) : (
                    // invisible spacer so text aligns with status options
                    <span className="h-2 w-2 shrink-0" />
                  )}

                  <span className="flex-1">{item.label}</span>

                  {isActive && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-[#F5A623]"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RentalFilters({
  search,
  setSearch,
  status,
  setStatus,
  time,
  setTime,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px_260px]">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search booking ID, customer or phone..."
          className="h-14 w-full rounded-2xl border border-white/10 bg-black pl-11 pr-4 text-sm text-white outline-none transition focus:border-[#F5A623] placeholder:text-zinc-600"
        />
      </div>

      {/* Status */}
      <FilterDropdown
        icon={SlidersHorizontal}
        value={status}
        options={statusOptions}
        onChange={setStatus}
        placeholder="All Statuses"
      />

      {/* Time */}
      <FilterDropdown
        icon={SlidersHorizontal}
        value={time}
        options={timeOptions}
        onChange={setTime}
        placeholder="All Time"
      />
    </div>
  );
}
