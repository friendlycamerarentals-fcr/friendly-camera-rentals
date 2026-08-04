import { TrendingUp } from "lucide-react";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = "#F5A623",
  change = "+12%",
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#F5A623]/30 hover:shadow-[0_0_40px_rgba(245,166,35,0.12)] cursor-pointer h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs md:text-sm text-zinc-400">{title}</p>

          <h3 className="mt-2 text-2xl md:text-4xl font-bold text-white">
            {value}
          </h3>

          <div className="mt-3 flex items-center gap-2 text-xs md:text-sm text-green-400">
            <TrendingUp size={14} />
            {change}
          </div>
        </div>

        <div
          className="flex h-11 w-11 md:h-14 md:w-14 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          <Icon size={20} className="md:size-[28]" />
        </div>
      </div>
    </div>
  );
}
