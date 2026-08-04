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
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#F5A623]/30 hover:shadow-[0_0_40px_rgba(245,166,35,0.12)]">
      {/* Glow */}
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#F5A623]/5 blur-3xl transition-all duration-300 group-hover:bg-[#F5A623]/10" />

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
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${border} ${bg} md:h-14 md:w-14`}
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
    </div>
  );
}
