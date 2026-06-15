"use client";

import { FiCamera, FiMic, FiPackage } from "react-icons/fi";
import { TbDrone } from "react-icons/tb";
import { FaCamera } from "react-icons/fa";
import { MdOutlineLightMode } from "react-icons/md";
import { motion } from "framer-motion";

const categories = [
  {
    value: "Camera",
    icon: FiCamera,
  },
  {
    value: "Lens",
    icon: FaCamera,
  },
  {
    value: "Drone",
    icon: TbDrone,
  },
  {
    value: "Lighting",
    icon: MdOutlineLightMode,
  },
  {
    value: "Audio",
    icon: FiMic,
  },
  {
    value: "Accessories",
    icon: FiPackage,
  },
];

export default function CategorySelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = value === category.value;

        return (
          <motion.button
            key={category.value}
            type="button"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(category.value)}
            className={`group rounded-2xl border p-2 transition-all duration-300 cursor-pointer ${
              isSelected
                ? "border-[#F5A623] bg-[#F5A623]/10 shadow-[0_10px_30px_rgba(245,166,35,0.2)]"
                : "border-white/10 bg-white/[0.04] hover:border-[#F5A623]/40"
            }`}
          >
            <div
              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${
                isSelected
                  ? "bg-[#F5A623] text-black"
                  : "bg-white/5 text-zinc-300 group-hover:text-[#F5A623]"
              }`}
            >
              <Icon size={26} />
            </div>

            <p
              className={`mt-4 text-sm font-medium ${
                isSelected ? "text-[#F5A623]" : "text-zinc-300"
              }`}
            >
              {category.value}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
