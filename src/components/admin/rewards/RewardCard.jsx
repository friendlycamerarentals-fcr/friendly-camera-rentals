"use client";

import { ArrowUpRight } from "lucide-react";

export default function RewardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "text-[#F5A623]",
  bg = "bg-[#F5A623]/10",
  border = "border-[#F5A623]/20",
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#F5A623]/30 hover:shadow-[0_0_40px_rgba(245,166,35,0.12)]">
      {/* Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#F5A623]/5 blur-3xl transition-all duration-300 group-hover:bg-[#F5A623]/10" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
          )}
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${border} ${bg}`}
        >
          <Icon size={26} className={color} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="text-xs font-medium text-zinc-500">
          Updated just now
        </span>

        <ArrowUpRight
          size={18}
          className="text-zinc-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#F5A623]"
        />
      </div>
    </div>
  );
}