const TONE_STYLES = {
  amber: {
    background: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/20 hover:border-amber-400/40",
    glow: "bg-amber-500/10",
  },
  blue: {
    background: "from-blue-500/20 to-sky-500/10",
    border: "border-blue-500/20 hover:border-blue-400/40",
    glow: "bg-blue-500/10",
  },
  green: {
    background: "from-green-500/20 to-emerald-500/10",
    border: "border-green-500/20 hover:border-green-400/40",
    glow: "bg-green-500/10",
  },
  purple: {
    background: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/20 hover:border-violet-400/40",
    glow: "bg-violet-500/10",
  },
  red: {
    background: "from-red-500/20 to-rose-500/10",
    border: "border-red-500/20 hover:border-red-400/40",
    glow: "bg-red-500/10",
  },
  yellow: {
    background: "from-yellow-500/20 to-amber-500/10",
    border: "border-yellow-500/20 hover:border-yellow-400/40",
    glow: "bg-yellow-500/10",
  },
  rose: {
    background: "from-rose-500/20 to-red-500/10",
    border: "border-rose-500/20 hover:border-rose-400/40",
    glow: "bg-rose-500/10",
  },
  emerald: {
    background: "from-emerald-500/20 to-green-500/10",
    border: "border-emerald-500/20 hover:border-emerald-400/40",
    glow: "bg-emerald-500/10",
  },
  gold: {
    background: "from-amber-500/20 to-yellow-500/10",
    border: "border-amber-500/20 hover:border-amber-400/40",
    glow: "bg-amber-500/10",
  },
};

export default function AdminGradientStatCard({
  tone = "amber",
  className = "",
  children,
}) {
  const styles = TONE_STYLES[tone] || TONE_STYLES.amber;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${styles.border} bg-gradient-to-br ${styles.background} backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${styles.glow} opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100`}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
