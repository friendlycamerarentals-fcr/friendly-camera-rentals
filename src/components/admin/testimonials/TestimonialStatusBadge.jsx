"use client";

import { motion } from "framer-motion";

export default function TestimonialStatusBadge({ status }) {
  const styles = {
    pending: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      border: "border-yellow-500/20",
      hoverBg: "hover:bg-yellow-500/20",
      hoverBorder: "hover:border-yellow-500/40",
      label: "⏳ Pending",
    },
    approved: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      border: "border-green-500/20",
      hoverBg: "hover:bg-green-500/20",
      hoverBorder: "hover:border-green-500/40",
      label: "✅ Approved",
    },
    rejected: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
      hoverBg: "hover:bg-red-500/20",
      hoverBorder: "hover:border-red-500/40",
      label: "❌ Rejected",
    },
  };

  const style = styles[status] || styles.pending;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all duration-300 ${style.bg} ${style.text} ${style.border} ${style.hoverBg} ${style.hoverBorder}`}
    >
      {style.label}
    </motion.span>
  );
}
