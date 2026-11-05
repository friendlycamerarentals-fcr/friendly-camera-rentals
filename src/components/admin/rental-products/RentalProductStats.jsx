"use client";

import {
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import AdminGradientStatCard from "@/components/admin/AdminGradientStatCard";

export default function RentalProductStats({ products = [] }) {
  const totalProducts = products.length;

  const availableProducts = products.filter(
    (product) => product.available,
  ).length;

  const unavailableProducts = products.filter(
    (product) => !product.available,
  ).length;

  const categories = new Set(products.map((product) => product.category)).size;

  const totalValue = products.reduce((sum, product) => {
    return sum + (product.pricing?.["24hrs"] || 0);
  }, 0);

  const lowStock = products.filter(
    (product) => (product.stock || 0) <= 2,
  ).length;

  const stats = [
    {
      title: "Products",
      value: totalProducts,
      icon: Package,
      color: "text-[#F5A623]",
      tone: "amber",
      bg: "bg-[#F5A623]/10",
    },
    {
      title: "Available",
      value: availableProducts,
      icon: CheckCircle2,
      color: "text-green-400",
      tone: "green",
      bg: "bg-green-500/10",
    },
    {
      title: "Unavailable",
      value: unavailableProducts,
      icon: XCircle,
      color: "text-red-400",
      tone: "red",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <AdminGradientStatCard
            key={stat.title}
            tone={stat.tone}
            className="p-3 md:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs text-zinc-500 md:text-sm">
                  {stat.title}
                </p>

                <h3 className="mt-1 text-lg font-bold text-white md:text-3xl">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl md:h-12 md:w-12 md:rounded-2xl ${stat.bg}`}
              >
                <Icon size={18} className={stat.color} />
              </div>
            </div>
          </AdminGradientStatCard>
        );
      })}
    </div>
  );
}
