import { TrendingUp } from "lucide-react";
import AdminGradientStatCard from "./AdminGradientStatCard";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  tone = "amber",
  color = "#F5A623",
  change = "+12%",
}) {
  return (
    <AdminGradientStatCard
      tone={tone}
      className="h-full min-w-0 cursor-pointer p-3 sm:p-4 md:p-6"
    >
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="min-w-0">
          <p className="text-[11px] text-zinc-400 sm:text-xs md:text-sm">{title}</p>

          <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl md:text-4xl">
            {value}
          </h3>

          <div className="mt-3 flex min-w-0 items-center gap-1 text-[10px] text-green-400 sm:gap-2 sm:text-xs md:text-sm">
            <TrendingUp size={12} className="shrink-0 sm:size-[14px]" />
            {change}
          </div>
        </div>

        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl md:h-14 md:w-14"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          <Icon size={16} className="sm:size-5 md:size-7" />
        </div>
      </div>
    </AdminGradientStatCard>
  );
}
