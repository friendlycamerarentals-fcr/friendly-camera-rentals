"use client";

import { motion } from "framer-motion";

export default function FilterTabs({
  testimonials = [],
  activeFilter,
  onFilterChange,
}) {
  const statusCounts = {
    all: testimonials.length,
    pending: testimonials.filter((item) => item.status === "pending").length,
    approved: testimonials.filter((item) => item.status === "approved").length,
    rejected: testimonials.filter((item) => item.status === "rejected").length,
  };

  const tabs = [
    { id: "all", label: "All", icon: "✨" },
    { id: "pending", label: "Pending", icon: "⏳" },
    { id: "approved", label: "Approved", icon: "✅" },
    { id: "rejected", label: "Rejected", icon: "❌" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 pt-1.5">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange(tab.id)}
          className={`relative px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeFilter === tab.id
              ? "bg-[#F5A623] text-black shadow-lg shadow-[#F5A623]/30"
              : "bg-zinc-950 border border-white/10 text-white hover:border-white/20 backdrop-blur-sm"
          }`}
        >
          <span>{tab.icon}</span>
          {tab.label}
          <span
            className={`ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
              activeFilter === tab.id
                ? "bg-black/30 text-black"
                : "bg-white/10 text-zinc-300"
            }`}
          >
            {statusCounts[tab.id]}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
