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

              <th className="px-6 py-4">Generated From</th>

              <th className="px-6 py-4">Reserved / Redeemed By</th>

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
                <td className="px-4 py-3.5 text-xs text-zinc-400 sm:px-6">
                  {index + 1}
                </td>

                <td className="break-all px-4 py-3.5 sm:px-6">
                  <span className="text-[13px] font-medium leading-5 text-[#F5A623]">
                    {reward.rewardId}
                  </span>
                </td>

                <td className="break-words px-4 py-3.5 sm:px-6">
                  <div>
                    <p className="text-[13px] font-medium leading-5 text-white">
                      {reward.customerName}
                    </p>
                  </div>
                </td>

                <td className="break-all px-4 py-3.5 text-xs leading-4 text-zinc-300 sm:px-6">
                  {reward.customerId}
                </td>

                <td className="break-words px-4 py-3.5 text-[13px] leading-5 text-zinc-300 sm:px-6">
                  {reward.contactNumber || "-"}
                </td>

                <td className="break-all px-4 py-3.5 text-xs leading-4 text-zinc-300 sm:px-6">
                  {reward.rentalRequestId || "-"}
                </td>

                <td className="break-all px-4 py-3.5 text-xs leading-4 text-zinc-300 sm:px-6">
                  {reward.appliedRentalId || reward.lastAppliedRentalId || "-"}
                </td>

                <td className="px-4 py-3.5 sm:px-6">
                  <span className="whitespace-nowrap rounded-full bg-[#F5A623]/10 px-2 py-0.5 text-xs font-medium leading-4 text-[#F5A623]">
                    ₹{Number(reward.rewardAmount || 0).toLocaleString("en-IN")}
                  </span>
                </td>

                <td className="px-4 py-3.5 sm:px-6">
                  <RewardStatusBadge status={reward.status} compact />
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-xs leading-4 text-zinc-400 sm:px-6">
                  {formatDate(reward.createdAt)}
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-xs leading-4 text-zinc-400 sm:px-6">
                  {formatDate(reward.expireDate)}
                </td>

                <td className="whitespace-nowrap px-4 py-3.5 text-xs leading-4 text-zinc-400 sm:px-6">
                  {formatDate(reward.usedDate)}
                </td>

                <td className="px-4 py-3.5 sm:px-6">
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
