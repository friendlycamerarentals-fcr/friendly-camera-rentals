"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, Trash2, CheckCircle, XCircle, Star } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";

import TestimonialStatusBadge from "./TestimonialStatusBadge";

export default function TestimonialCard({
  testimonial,
  onApprove,
  onReject,
  onDelete,
  onView,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#F5A623]/40 hover:shadow-[0_25px_50px_rgba(245,166,35,0.15)]"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5A623]/10 via-transparent to-transparent blur-xl" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header: Avatar + Info + Status Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {testimonial.image ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-[#F5A623]/20 transition-all duration-300"
                >
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </motion.div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5A623]/20 ring-2 ring-[#F5A623]/10 transition-all duration-300 group-hover:ring-[#F5A623]/40">
                  <FaUserCircle className="h-8 w-8 text-[#F5A623]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold text-white group-hover:text-[#F5A623] transition-colors duration-300">
                {testimonial.name}
              </h3>

              <p className="truncate text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                {testimonial.designation || "FCR Customer"}
              </p>

              {/* Rating */}
              <div className="mt-2 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.2 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Star
                      size={16}
                      className={`${
                        i < (testimonial.rating || 5)
                          ? "fill-[#F5A623] text-[#F5A623]"
                          : "text-zinc-600"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <TestimonialStatusBadge status={testimonial.status} />
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

        {/* Review */}
        <div className="space-y-2">
          <p className="line-clamp-3 text-sm leading-relaxed text-zinc-300 group-hover:text-zinc-200 transition-colors duration-300">
            "{testimonial.review}"
          </p>
        </div>

        {/* Date */}
        <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">
          {new Date(testimonial.createdAt).toLocaleDateString()} at{" "}
          {new Date(testimonial.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onApprove(testimonial.id)}
            className="flex items-center gap-2 rounded-xl bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 border border-green-500/20 transition-all duration-300 hover:bg-green-500/20 hover:border-green-500/40 cursor-pointer flex-1"
          >
            <CheckCircle size={14} />
            Approve
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onReject(testimonial.id)}
            className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 border border-red-500/20 transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/40 cursor-pointer flex-1"
          >
            <XCircle size={14} />
            Reject
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(testimonial)}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition-all duration-300 hover:border-white/30 hover:text-white hover:bg-white/5 cursor-pointer flex-1"
          >
            <Eye size={14} />
            View
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(testimonial.id)}
            className="flex items-center justify-center rounded-xl border border-red-500/20 p-2 text-red-400 transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/40 cursor-pointer"
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
