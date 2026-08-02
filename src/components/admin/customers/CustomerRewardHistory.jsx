"use client";

import { Gift, CalendarDays, Clock3 } from "lucide-react";
import RewardStatusBadge from "@/components/admin/rewards/RewardStatusBadge";

export default function CustomerRewardHistory({
  rewards = [],
  loading = false,
}) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
        <div className="mb-6 h-7 w-56 animate-pulse rounded bg-white/10" />

        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!rewards.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#111111] p-10 text-center">
        <Gift size={60} className="mx-auto mb-4 text-[#F5A623]" />

        <h2 className="text-2xl font-bold text-white">No Reward History</h2>

        <p className="mt-3 text-zinc-400">
          This customer hasn't earned any rewards yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111111]">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-2xl font-bold text-white">
          Customer Reward History
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Complete reward timeline for this customer.
        </p>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="relative border-l border-white/10 pl-8">
          {rewards.map((reward) => (
            <div key={reward.id} className="relative mb-8 last:mb-0">
              {/* Timeline Dot */}
              <div className="absolute -left-[42px] flex h-8 w-8 items-center justify-center rounded-full border border-[#F5A623]/30 bg-[#F5A623]/10">
                <Gift size={16} className="text-[#F5A623]" />
              </div>

              {/* Card */}
              <div className="rounded-2xl border border-white/10 bg-[#181818] p-5 transition hover:border-[#F5A623]/30">
                {/* Top */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {reward.rewardId}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      Rental ID : {reward.rentalRequestId}
                    </p>
                  </div>

                  <RewardStatusBadge status={reward.status} />
                </div>

                {/* Details */}
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Reward Amount
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#F5A623]">
                      ₹{reward.rewardAmount?.toLocaleString("en-IN") || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Reward %
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {reward.rewardPercentage}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Rental Date
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-white">
                      <CalendarDays size={16} />
                      {reward.rentalDate}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Expire Date
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-white">
                      <Clock3 size={16} />

                      {reward.expireDate
                        ? new Date(reward.expireDate).toLocaleDateString(
                            "en-IN",
                          )
                        : "-"}
                    </div>
                  </div>
                </div>

                {/* Applied Details */}
                {(reward.appliedRentalId || reward.appliedDate) && (
                  <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
                    <h4 className="mb-3 font-semibold text-green-400">
                      Reward Usage
                    </h4>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Applied Rental
                        </p>

                        <p className="mt-1 text-white">
                          {reward.appliedRentalId}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
                          Applied Date
                        </p>

                        <p className="mt-1 text-white">
                          {reward.appliedDate
                            ? new Date(reward.appliedDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-sm text-zinc-500">
                  <span>
                    Created :{" "}
                    {new Date(reward.createdAt).toLocaleDateString("en-IN")}
                  </span>

                  <span>
                    Last Updated :{" "}
                    {new Date(reward.updatedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
