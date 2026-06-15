"use client";

import { motion } from "framer-motion";

const categories = [
  "All",
  "Camera",
  "Lens",
  "Drone",
  "Lighting",
  "Audio",
  "Accessories",
];

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {categories.map((category) => {
        const isActive = selected === category;

        return (
          <motion.button
            key={category}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(category)}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer ${
              isActive
                ? "border-[#F5A623] bg-[#F5A623] text-black shadow-[0_10px_25px_rgba(245,166,35,0.3)]"
                : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-[#F5A623]/50 hover:text-[#F5A623]"
            }`}
          >
            {category}
          </motion.button>
        );
      })}
    </div>
  );
}
