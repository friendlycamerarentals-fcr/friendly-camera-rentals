import { TrendingUp } from "lucide-react";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = "#F5A623",
  change = "+12%",
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#F5A623]/30 hover:shadow-[0_0_40px_rgba(245,166,35,0.12)] cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>

          <h3 className="mt-3 text-4xl font-bold text-white">{value}</h3>

          <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
            <TrendingUp size={16} />
            {change}
          </div>
        </div>

        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}
