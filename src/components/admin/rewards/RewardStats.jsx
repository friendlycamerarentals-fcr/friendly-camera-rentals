"use client";

import {
  Gift,
  BadgeCheck,
  WalletCards,
  CheckCircle2,
  Clock3,
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
      <RewardCard
        title="Total Rewards"
        value={stats.total}
        subtitle="Rewards Generated"
        icon={Gift}
      />

      <RewardCard
        title="Active Rewards"
        value={stats.active}
        subtitle="Available for Customers"
        icon={BadgeCheck}
        color="text-emerald-400"
        bg="bg-emerald-500/10"
        border="border-emerald-500/20"
      />

      <RewardCard
        title="Applied Rewards"
        value={stats.applied}
        subtitle="Discount Applied"
        icon={WalletCards}
        color="text-amber-400"
        bg="bg-amber-500/10"
        border="border-amber-500/20"
      />

      <RewardCard
        title="Used Rewards"
        value={stats.used}
        subtitle="Successfully Redeemed"
        icon={CheckCircle2}
        color="text-blue-400"
        bg="bg-blue-500/10"
        border="border-blue-500/20"
      />

      <RewardCard
        title="Expired Rewards"
        value={stats.expired}
        subtitle="Reward Validity Ended"
        icon={Clock3}
        color="text-red-400"
        bg="bg-red-500/10"
        border="border-red-500/20"
      />
    </div>
  );
}