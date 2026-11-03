"use client";

import {
  Gift,
  BadgeCheck,
  WalletCards,
  CheckCircle2,
  Clock3,
  Banknote,
} from "lucide-react";

import RewardCard from "./RewardCard";

export default function RewardStats({
  stats = {
    total: 0,
    active: 0,
    applied: 0,
    used: 0,
    expired: 0,
  },
}) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
      <RewardCard
        title="Total Rewards"
        value={stats.total}
        subtitle="Rewards Generated"
        icon={Gift}
        tone="amber"
      />

      <RewardCard
        title="Active Rewards"
        value={stats.active}
        subtitle="Available for Customers"
        icon={BadgeCheck}
        color="text-emerald-400"
        tone="emerald"
      />

      <RewardCard
        title="Applied Rewards"
        value={stats.applied}
        subtitle="Reserved pending redemption"
        icon={WalletCards}
        color="text-yellow-400"
        tone="yellow"
      />

      <RewardCard
        title="Used Rewards"
        value={stats.used}
        subtitle="Successfully Redeemed"
        icon={CheckCircle2}
        color="text-blue-400"
        tone="blue"
      />

      <RewardCard
        title="Total Reward Value"
        value={`₹${Number(stats.totalValue || 0).toLocaleString("en-IN")}`}
        subtitle="All reward amounts"
        icon={Banknote}
        color="text-[#F5A623]"
        tone="gold"
      />

      <RewardCard
        title="Expired Rewards"
        value={stats.expired}
        subtitle="Reward Validity Ended"
        icon={Clock3}
        color="text-red-400"
        tone="red"
      />
    </div>
  );
}
