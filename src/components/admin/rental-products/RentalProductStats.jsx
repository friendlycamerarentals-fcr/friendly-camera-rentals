"use client";

import {
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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
      bg: "bg-[#F5A623]/10",
    },
    {
      title: "Available",
      value: availableProducts,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      title: "Unavailable",
      value: unavailableProducts,
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-2xl border border-white/10 bg-zinc-950 p-3 md:p-5 transition-all duration-300 hover:border-[#F5A623]/20 hover:bg-zinc-900"
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
          </div>
        );
      })}
    </div>
  );
}
