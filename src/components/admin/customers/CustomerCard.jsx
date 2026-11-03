"use client";

import ProfileAvatar from "@/components/common/ProfileAvatar";
import { Mail, Phone, Eye } from "lucide-react";

export default function CustomerCard({ customer, onView }) {
  return (
    <div className="group min-w-0 rounded-2xl border border-white/10 bg-zinc-950 p-2 transition-all hover:border-[#F5A623]/30 sm:p-4 lg:p-6">
      {/* Profile */}
      <div className="flex min-w-0 flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center sm:h-24 sm:w-24">
          <div className="scale-100 sm:scale-200">
            <ProfileAvatar
              src={customer.profileImage}
              alt={customer.name}
              size={48}
            />
          </div>
        </div>

        <h3 className="mt-2 line-clamp-2 max-w-full break-words text-center text-sm font-semibold leading-tight text-white [overflow-wrap:anywhere] sm:mt-4 sm:line-clamp-none sm:text-xl sm:leading-normal">
          {customer.name}
        </h3>

        <p className="mt-0.5 max-w-full break-all text-center text-xs font-medium leading-tight text-[#F5A623] sm:mt-1 sm:text-sm sm:leading-normal">
          {customer.customerId}
        </p>
      </div>

      {/* Details */}
      <div className="mt-2 min-w-0 space-y-2 text-xs leading-tight text-zinc-300 sm:mt-6 sm:space-y-3 sm:text-sm sm:leading-normal">
        <div className="flex min-w-0 items-start gap-1.5 sm:gap-3">
          <Mail size={14} className="mt-0.5 shrink-0 sm:size-4" />
          <span className="min-w-0 break-all">{customer.email}</span>
        </div>

        <div className="flex min-w-0 items-start gap-1.5 sm:gap-3">
          <Phone size={14} className="mt-0.5 shrink-0 sm:size-4" />
          <span className="min-w-0 break-all">
            {customer.phoneNumber || "Not Added"}
          </span>
        </div>
      </div>

      {/* Joined */}
      <div className="mt-2 min-w-0 border-t border-white/5 pt-2 sm:mt-6 sm:pt-4">
        <p className="break-words text-xs text-zinc-500">
          Joined {new Date(customer.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Action */}
      <button
        onClick={() => onView(customer)}
        className="mt-2 flex min-h-10 w-full min-w-0 items-center justify-center gap-1 rounded-xl bg-[#F5A623] px-1.5 py-1.5 text-xs font-semibold leading-tight text-black transition hover:opacity-90 sm:mt-4 sm:min-h-11 sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm sm:leading-normal"
      >
        <Eye size={16} className="shrink-0 sm:size-[18px]" />
        View Details
      </button>
    </div>
  );
}
