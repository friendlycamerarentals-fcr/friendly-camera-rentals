"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Package,
  CheckCircle2,
  XCircle,
  Rows3,
} from "lucide-react";
import Link from "next/link";

const categoryOptions = [
  { label: "All Categories", value: "all" },
  { label: "Camera", value: "camera" },
  { label: "Lens", value: "lens" },
  { label: "Drone", value: "drone" },
  { label: "Gimbal", value: "gimbal" },
  { label: "Light", value: "light" },
  { label: "Audio", value: "audio" },
  { label: "Tripod", value: "tripod" },
];

const statusOptions = [
  {
    label: "All Status",
    value: "all",
    icon: Package,
  },
  {
    label: "Available",
    value: "available",
    icon: CheckCircle2,
  },
  {
    label: "Unavailable",
    value: "unavailable",
    icon: XCircle,
  },
];

function Dropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-white/10 bg-zinc-950 px-4 text-sm text-white transition hover:border-[#F5A623]/40 cursor-pointer"
      >
        <span>
          {options.find((o) => o.value === value)?.label || placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
          {options.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.value}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-white/5 ${
                  value === item.value
                    ? "bg-[#F5A623]/10 text-[#F5A623]"
                    : "text-zinc-300"
                }`}
              >
                {Icon && <Icon size={16} />}

                <span>{item.label}</span>

                {value === item.value && <span className="ml-auto">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RentalProductFilters({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  onReorder,
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto_auto]">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[#F5A623]"
          />
        </div>

        {/* Category */}
        <Dropdown
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          placeholder="Category"
        />

        {/* Status */}
        <Dropdown
          value={status}
          onChange={setStatus}
          options={statusOptions}
          placeholder="Status"
        />

        {/* Reorder */}
        <button
          onClick={onReorder}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <Rows3 size={18} />
          Reorder
        </button>

        {/* Add Product */}
        <Link
          href="/admin/rental-products/add"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#F5A623] px-5 text-sm font-semibold text-black transition hover:opacity-90"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>
    </div>
  );
}
