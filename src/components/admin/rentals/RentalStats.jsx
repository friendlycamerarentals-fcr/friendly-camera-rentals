"use client";

import {
  Camera,
  Clock3,
  CheckCircle,
  IndianRupee,
  XCircle,
  RotateCcw,
} from "lucide-react";
import AdminGradientStatCard from "@/components/admin/AdminGradientStatCard";

export default function RentalStats({ bookings = [] }) {
  const totalBookings = bookings.length;

  const pending = bookings.filter((b) => b.status === "Pending").length;

  const confirmed = bookings.filter((b) => b.status === "Confirmed").length;

  const completed = bookings.filter((b) => b.status === "Completed").length;

  const cancelled = bookings.filter((b) => b.status === "Cancelled").length;

  const rejected = bookings.filter((b) => b.status === "Rejected").length;

  const revenue = bookings
    .filter((b) => b.status === "Completed")
    .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

  const stats = [
    {
      title: "Total Rentals",
      value: totalBookings,
      icon: Camera,
      color: "text-[#F5A623]",
      tone: "amber",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      color: "text-yellow-400",
      tone: "yellow",
    },
    {
      title: "Confirmed",
      value: confirmed,
      icon: CheckCircle,
      color: "text-blue-400",
      tone: "blue",
    },
    {
      title: "Completed",
      value: completed,
      icon: RotateCcw,
      color: "text-green-400",
      tone: "green",
    },
    {
      title: "Cancelled",
      value: cancelled,
      icon: XCircle,
      color: "text-red-400",
      tone: "red",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "text-red-300",
      tone: "rose",
    },
    {
      title: "Revenue",
      value: `₹${revenue.toLocaleString()}`,
      icon: IndianRupee,
      color: "text-emerald-400",
      tone: "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <AdminGradientStatCard
            key={stat.title}
            tone={stat.tone}
            className="cursor-pointer p-3 md:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-zinc-500 truncate">
                  {stat.title}
                </p>

                <h3 className="mt-1 text-xl md:text-3xl font-bold text-white">
                  {stat.value}
                </h3>
              </div>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 md:h-12 md:w-12 md:rounded-2xl"
              >
                <Icon size={16} className={`md:h-5 md:w-5 ${stat.color}`} />
              </div>
            </div>
          </AdminGradientStatCard>
        );
      })}
    </div>
  );
}
