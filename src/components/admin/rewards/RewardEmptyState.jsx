"use client";

import { Gift, Sparkles } from "lucide-react";

export default function RewardEmptyState({
  title = "No Rewards Found",
  description = "Reward records will appear here automatically after rental bookings are marked as Completed.",
}) {
  return (
    <div className="flex min-h-[420px] w-full items-center justify-center rounded-3xl border border-white/10 bg-[#0F0F10] px-6 py-12">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-[#F5A623]/20 bg-[#F5A623]/10">
          <Gift className="h-12 w-12 text-[#F5A623]" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {title}
        </h2>

        {/* Description */}
        <p className="mt-4 text-sm leading-7 text-zinc-400">{description}</p>

        {/* Info Card */}
        <div className="mt-8 rounded-2xl border border-[#F5A623]/20 bg-[#F5A623]/5 p-5 text-left">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#F5A623]" />
            <span className="font-semibold text-[#F5A623]">Reward System</span>
          </div>

          <ul className="space-y-2 text-sm text-zinc-300">
            <li>• Reward is created automatically after rental completion.</li>
            <li>• Customer earns 10% reward points.</li>
            <li>• Reward remains valid for 3 months.</li>
            <li>• Rewards are linked using Customer ID.</li>
            <li>• Expired rewards are automatically marked as Expired.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
