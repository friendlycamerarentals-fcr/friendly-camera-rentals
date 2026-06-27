"use client";

import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

export default function ServiceStats({ bookings = [] }) {
  const total = bookings.length;

  const pending = bookings.filter((item) => item.status === "pending").length;

  const confirmed = bookings.filter(
    (item) => item.status === "confirmed",
  ).length;

  const completed = bookings.filter(
    (item) => item.status === "completed",
  ).length;

  const cancelled = bookings.filter(
    (item) => item.status === "cancelled",
  ).length;

  const stats = [
    {
      title: "Total Bookings",
      value: total,
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Confirmed",
      value: confirmed,
      icon: CheckCircle,
      color: "text-[#F5A623]",
      bg: "bg-[#F5A623]/10",
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">{stat.title}</p>

                <h3 className="mt-2 text-4xl font-bold text-white">
                  {stat.value}
                </h3>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg}`}
              >
                <Icon size={28} className={stat.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
