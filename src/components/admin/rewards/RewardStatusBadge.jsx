"use client";

import { CheckCircle2, Clock3, Gift, WalletCards } from "lucide-react";

const STATUS_CONFIG = {
  Active: {
    label: "Active",
    icon: Gift,
    className:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },

  Applied: {
    label: "Applied",
    icon: WalletCards,
    className:
      "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },

  Used: {
    label: "Used",
    icon: CheckCircle2,
    className:
      "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },

  Expired: {
    label: "Expired",
    icon: Clock3,
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
};

export default function RewardStatusBadge({ status = "Active" }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Active;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}