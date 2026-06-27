"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function DateFilters({ activeDateFilter, onDateFilterChange }) {
  const dateFilters = [
    { id: "all-time", label: "All Time", icon: Calendar },
    { id: "today", label: "Today", icon: Calendar },
    { id: "last-7-days", label: "Last 7 Days", icon: Calendar },
    { id: "last-30-days", label: "Last 30 Days", icon: Calendar },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 pt-1.5 ml-2.5 pl-2">
      {dateFilters.map((filter) => {
        const Icon = filter.icon;

        return (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDateFilterChange(filter.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${
              activeDateFilter === filter.id
                ? "bg-[#F5A623]/20 border border-[#F5A623] text-[#F5A623]"
                : "bg-zinc-950 border border-white/10 text-zinc-400 hover:border-white/20 backdrop-blur-sm"
            }`}
          >
            <Icon size={14} />
            {filter.label}
          </motion.button>
        );
      })}
    </div>
  );
}
