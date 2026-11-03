"use client";

import { ArrowUpRight } from "lucide-react";
import AdminGradientStatCard from "@/components/admin/AdminGradientStatCard";

export default function RewardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "amber",
  color = "text-[#F5A623]",
}) {
  return (
    <AdminGradientStatCard tone={tone} className="p-4 md:p-6">
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-4xl">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-xs text-zinc-500 md:text-sm">{subtitle}</p>
          )}
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 md:h-14 md:w-14"
        >
          <Icon size={20} className={color} />
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-2 md:mt-2">
        <span className="text-xs font-medium text-zinc-500">
          Updated just now
        </span>

        <ArrowUpRight
          size={18}
          className="text-zinc-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#F5A623]"
        />
      </div>
    </AdminGradientStatCard>
  );
}
