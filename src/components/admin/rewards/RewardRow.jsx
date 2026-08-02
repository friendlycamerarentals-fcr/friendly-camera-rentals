"use client";

import { Eye, Clock3 } from "lucide-react";
import RewardStatusBadge from "./RewardStatusBadge";

export default function RewardRow({ index, reward, onView, onTimeline }) {
  return (
    <tr className="border-b border-white/5 transition hover:bg-white/[0.02]">
      {/* Serial Number */}
      <td className="px-5 py-4 text-center font-medium text-white">
        {index + 1}
      </td>

      {/* Reward ID */}
      <td className="px-5 py-4">
        <span className="rounded-lg bg-[#F5A623]/10 px-3 py-1 text-sm font-semibold text-[#F5A623]">
          {reward.rewardId}
        </span>
      </td>

      {/* Customer */}
      <td className="px-5 py-4">
        <div>
          <p className="font-semibold text-white">{reward.customerName}</p>

          <p className="mt-1 text-xs text-zinc-500">{reward.customerId}</p>
        </div>
      </td>

      {/* Contact */}
      <td className="px-5 py-4 text-zinc-300">{reward.contactNumber || "-"}</td>

      {/* Rental Request */}
      <td className="px-5 py-4">
        <span className="text-sm text-zinc-300">{reward.rentalRequestId}</span>
      </td>

      {/* Rental Date */}
      <td className="px-5 py-4 text-sm text-zinc-300">{reward.rentalDate}</td>

      {/* Reward */}
      <td className="px-5 py-4">
        <div className="flex flex-col">
          <span className="font-semibold text-[#F5A623]">
            ₹{reward.rewardAmount ?? 0}
          </span>

          <span className="text-xs text-zinc-500">
            {reward.rewardPercentage}%
          </span>
        </div>
      </td>

      {/* Expiry */}
      <td className="px-5 py-4 text-sm text-zinc-300">
        {reward.expireDate
          ? new Date(reward.expireDate).toLocaleDateString("en-IN")
          : "-"}
      </td>

      {/* Status */}
      <td className="px-5 py-4 text-center">
        <RewardStatusBadge status={reward.status} />
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center justify-center gap-2">
          {/* View */}
          <button
            onClick={() => onView(reward)}
            className="rounded-xl border border-[#F5A623]/20 bg-[#F5A623]/10 p-2 text-[#F5A623] transition hover:bg-[#F5A623] hover:text-black"
            title="View Details"
          >
            <Eye size={18} />
          </button>

          {/* Timeline */}
          <button
            onClick={() => onTimeline(reward)}
            className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400 transition hover:bg-blue-500 hover:text-white"
            title="Reward Timeline"
          >
            <Clock3 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
