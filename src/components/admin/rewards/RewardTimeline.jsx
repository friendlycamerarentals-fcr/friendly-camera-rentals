"use client";

import {
  CalendarDays,
  Gift,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

export default function RewardTimeline({ reward }) {
  if (!reward) return null;

  const timeline = [
    {
      title: "Reward Created",
      date: reward.createdAt,
      icon: <Gift size={18} />,
      color: "text-[#F5A623]",
      active: true,
    },
    {
      title: "Reward Activated",
      date: reward.createdAt,
      icon: <CheckCircle2 size={18} />,
      color: "text-green-400",
      active: true,
    },
    {
      title: "Reward Applied",
      date: reward.appliedDate,
      icon: <Clock3 size={18} />,
      color: "text-blue-400",
      active: !!reward.appliedDate,
    },
    {
      title: "Reward Used",
      date: reward.usedDate,
      icon: <CheckCircle2 size={18} />,
      color: "text-emerald-400",
      active: !!reward.usedDate,
    },
    {
      title: "Reward Expired",
      date: reward.expiredDate,
      icon: <XCircle size={18} />,
      color: "text-red-400",
      active: !!reward.expiredDate,
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0F0F10] p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Reward Timeline</h2>

        <p className="mt-2 text-sm text-zinc-400">
          Complete lifecycle of this reward.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative ml-4 border-l border-white/10">
        {timeline.map((item, index) => (
          <div key={index} className="relative mb-8 pl-8 last:mb-0">
            {/* Dot */}
            <div
              className={`absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full border ${
                item.active
                  ? "border-[#F5A623] bg-[#F5A623]/20"
                  : "border-zinc-700 bg-[#181818]"
              }`}
            >
              <span className={item.active ? item.color : "text-zinc-600"}>
                {item.icon}
              </span>
            </div>

            {/* Content */}
            <div className="rounded-2xl border border-white/5 bg-[#141414] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3
                    className={`font-semibold ${
                      item.active ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                    <CalendarDays size={15} />

                    {item.date ? (
                      new Date(item.date).toLocaleString("en-IN")
                    ) : (
                      <span>Pending</span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.active
                      ? "bg-green-500/15 text-green-400"
                      : "bg-zinc-700/30 text-zinc-500"
                  }`}
                >
                  {item.active ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 rounded-2xl border border-[#F5A623]/20 bg-[#F5A623]/5 p-5">
        <h3 className="mb-3 text-lg font-semibold text-[#F5A623]">
          Reward Summary
        </h3>

        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-zinc-500">Reward ID</p>
            <p className="font-semibold text-white">{reward.rewardId}</p>
          </div>

          <div>
            <p className="text-zinc-500">Customer ID</p>
            <p className="font-semibold text-white">{reward.customerId}</p>
          </div>

          <div>
            <p className="text-zinc-500">Reward Amount</p>
            <p className="font-semibold text-[#F5A623]">
              ₹{reward.rewardAmount ?? 0}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">Current Status</p>
            <p className="font-semibold text-white">{reward.status}</p>
          </div>

          <div>
            <p className="text-zinc-500">Expires On</p>
            <p className="font-semibold text-white">
              {reward.expireDate
                ? new Date(reward.expireDate).toLocaleDateString("en-IN")
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">Applied Rental</p>
            <p className="font-semibold text-white">
              {reward.appliedRentalId || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
