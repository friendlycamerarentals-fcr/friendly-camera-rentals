"use client";

import { Eye, Gift } from "lucide-react";
import RewardStatusBadge from "./RewardStatusBadge";
import { formatDate } from "@/lib/rewards/rewardHelpers";

export default function RewardTable({ rewards = [], onView }) {
  if (!rewards.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-zinc-950 py-20">
        <Gift size={50} className="text-[#F5A623]" />

        <h3 className="mt-5 text-xl font-semibold text-white">
          No Rewards Found
        </h3>

        <p className="mt-2 text-zinc-500">
          Rewards will appear here once rentals are completed.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-white/10 bg-black/30">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-4">#</th>

              <th className="px-6 py-4">Reward ID</th>

              <th className="px-6 py-4">Customer</th>

              <th className="px-6 py-4">Customer ID</th>

              <th className="px-6 py-4">Contact</th>

              <th className="px-6 py-4">Rental ID</th>

              <th className="px-6 py-4">Reward</th>

              <th className="px-6 py-4">Status</th>

              <th className="px-6 py-4">Generated</th>

              <th className="px-6 py-4">Expires</th>

              <th className="px-6 py-4">Used Date</th>

              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {rewards.map((reward, index) => (
              <tr
                key={reward.rewardId}
                className="border-b border-white/5 transition hover:bg-white/5"
              >
                <td className="px-6 py-5 text-sm text-zinc-400">{index + 1}</td>

                <td className="px-6 py-5">
                  <span className="font-semibold text-[#F5A623]">
                    {reward.rewardId}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div>
                    <p className="font-medium text-white">
                      {reward.customerName}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-5 text-zinc-300">{reward.customerId}</td>

                <td className="px-6 py-5 text-zinc-300">
                  {reward.contactNumber || "-"}
                </td>

                <td className="px-6 py-5 text-zinc-300">
                  {reward.rentalRequestId || "-"}
                </td>

                <td className="px-6 py-5">
                  <span className="rounded-full bg-[#F5A623]/10 px-3 py-1 text-sm font-semibold text-[#F5A623]">
                    ₹{Number(reward.rewardAmount || 0).toLocaleString("en-IN")}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <RewardStatusBadge status={reward.status} />
                </td>

                <td className="px-6 py-5 text-zinc-400">
                  {formatDate(reward.createdAt)}
                </td>

                <td className="px-6 py-5 text-zinc-400">
                  {formatDate(reward.expireDate)}
                </td>

                <td className="px-6 py-5 text-zinc-400">
                  {formatDate(reward.usedDate)}
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <button
                      onClick={() => onView(reward)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-300 transition hover:border-[#F5A623]/40 hover:bg-[#F5A623]/10 hover:text-[#F5A623]"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
