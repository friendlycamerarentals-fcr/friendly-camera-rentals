"use client";

import ProfileAvatar from "@/components/common/ProfileAvatar";
import { Mail, Phone, Eye } from "lucide-react";

export default function CustomerCard({ customer, onView }) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-zinc-950 p-6 transition-all hover:border-[#F5A623]/30">
      {/* Profile */}
      <div className="flex flex-col items-center">
        <ProfileAvatar
          src={customer.profileImage}
          alt={customer.name}
          size={96}
        />

        <h3 className="mt-4 text-xl font-semibold text-white text-center">
          {customer.name}
        </h3>

        <p className="mt-1 text-sm font-medium text-[#F5A623]">
          {customer.customerId}
        </p>
      </div>

      {/* Details */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-zinc-300">
          <Mail size={16} />
          <span className="truncate">{customer.email}</span>
        </div>

        <div className="flex items-center gap-3 text-zinc-300">
          <Phone size={16} />
          <span>{customer.phoneNumber || "Not Added"}</span>
        </div>
      </div>

      {/* Joined */}
      <div className="mt-6 border-t border-white/5 pt-4">
        <p className="text-xs text-zinc-500">
          Joined {new Date(customer.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Action */}
      <button
        onClick={() => onView(customer)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F5A623] px-4 py-3 font-semibold text-black transition hover:opacity-90"
      >
        <Eye size={18} />
        View Details
      </button>
    </div>
  );
}
