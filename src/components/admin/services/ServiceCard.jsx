"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Phone,
  User,
  Camera,
  Eye,
  Zap,
} from "lucide-react";

import ServiceStatusBadge from "./ServiceStatusBadge";

export default function ServiceCard({ booking, onView }) {
  const isUrgent = booking.status === "pending";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onView(booking)}
      className="group cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all hover:border-[#F5A623]/50 hover:shadow-2xl hover:shadow-[#F5A623]/10 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">
            {booking.fullName}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">{booking.shootType}</p>
        </div>

        <div className="flex gap-2">
          {isUrgent && (
            <div className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1">
              <Zap size={12} className="text-red-400" />
              <span className="text-xs font-semibold text-red-400">New</span>
            </div>
          )}

          <ServiceStatusBadge status={booking.status} />
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3 text-sm text-zinc-300 transition-colors group-hover:text-zinc-200">
          <Phone size={16} className="text-[#F5A623]" />

          <span>{booking.phone}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-zinc-300 transition-colors group-hover:text-zinc-200">
          <Camera size={16} className="text-[#F5A623]" />

          <span>{booking.shootType}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-zinc-300 transition-colors group-hover:text-zinc-200">
          <CalendarDays size={16} className="text-[#F5A623]" />

          <span>{booking.eventDate}</span>
        </div>

        <div className="flex items-start gap-3 text-sm text-zinc-300 transition-colors group-hover:text-zinc-200">
          <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#F5A623]" />

          <span className="line-clamp-1">{booking.location}</span>
        </div>
      </div>

      {/* Description */}
      {booking.description && (
        <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-3">
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
            {booking.description}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500">
            {new Date(booking.createdAt).toLocaleDateString()}
          </span>

          <span className="text-xs text-zinc-600">
            {new Date(booking.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onView(booking);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#F5A623] px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-[#F5A623]/90"
        >
          <Eye size={16} />
          View
        </motion.button>
      </div>
    </motion.div>
  );
}
