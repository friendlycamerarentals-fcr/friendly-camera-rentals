"use client";

import { motion } from "framer-motion";
import {
  FiStar,
  FiThumbsUp,
  FiCheckCircle,
  FiTool,
  FiAlertCircle,
} from "react-icons/fi";

const conditions = [
  {
    value: "Like New",
    icon: FiStar,
    description: "Almost unused condition",
  },
  {
    value: "Excellent",
    icon: FiCheckCircle,
    description: "Very minimal wear",
  },
  {
    value: "Good",
    icon: FiThumbsUp,
    description: "Normal usage marks",
  },
  {
    value: "Fair",
    icon: FiAlertCircle,
    description: "Visible wear & tear",
  },
  {
    value: "Needs Repair",
    icon: FiTool,
    description: "Requires servicing",
  },
];

export default function ConditionSelector({ value, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {conditions.map((condition) => {
        const Icon = condition.icon;
        const isSelected = value === condition.value;

        return (
          <motion.button
            key={condition.value}
            type="button"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(condition.value)}
            className={`rounded-2xl border p-3 text-left transition-all duration-300 cursor-pointer ${
              isSelected
                ? "border-[#F5A623] bg-[#F5A623]/10 shadow-[0_10px_30px_rgba(245,166,35,0.2)]"
                : "border-white/10 bg-white/[0.04] hover:border-[#F5A623]/40"
            }`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                isSelected
                  ? "bg-[#F5A623] text-black"
                  : "bg-white/5 text-zinc-300"
              }`}
            >
              <Icon size={22} />
            </div>

            <h3
              className={`mt-4 font-semibold ${
                isSelected ? "text-[#F5A623]" : "text-white"
              }`}
            >
              {condition.value}
            </h3>

            <p className="mt-2 text-sm text-zinc-400">
              {condition.description}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
