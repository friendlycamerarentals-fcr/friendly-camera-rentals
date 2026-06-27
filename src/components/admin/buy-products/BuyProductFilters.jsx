"use client";

import Link from "next/link";
import {
  Search,
  Plus,
  Package,
  CheckCircle2,
  XCircle,
  Rows3,
} from "lucide-react";
import FilterDropdown from "@/components/admin/products/FilterDropdown";

const categoryOptions = [
  { label: "All Categories", value: "all" },
  { label: "Camera", value: "camera" },
  { label: "Lens", value: "lens" },
  { label: "Drone", value: "drone" },
  { label: "Gimbal", value: "gimbal" },
  { label: "Light", value: "light" },
  { label: "Audio", value: "audio" },
  { label: "Tripod", value: "tripod" },
  { label: "Accessories", value: "accessories" },
];

const statusOptions = [
  { label: "All Statuses", value: "all", icon: Package },
  { label: "In Stock", value: "In Stock", icon: CheckCircle2 },
  { label: "Out of Stock", value: "Out of Stock", icon: Package },
  { label: "Sold", value: "Sold", icon: XCircle },
];

export default function BuyProductFilters({
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

        <FilterDropdown
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          placeholder="Category"
        />

        <FilterDropdown
          value={status}
          onChange={setStatus}
          options={statusOptions}
          placeholder="Status"
        />

        <button
          onClick={onReorder}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <Rows3 size={18} />
          Reorder
        </button>

        <Link
          href="/admin/buy-products/add"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#F5A623] px-5 text-sm font-semibold text-black transition hover:opacity-90"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>
    </div>
  );
}
