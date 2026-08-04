"use client";

import ProfileAvatar from "@/components/common/ProfileAvatar";
import { X, Mail, Phone, MapPin } from "lucide-react";

export default function CustomerModal({ open, onClose, customer }) {
  if (!open || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Customer Details</h2>

            <p className="mt-1 text-zinc-500">{customer.customerId}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Profile */}
          <div className="flex flex-col items-center">
            <ProfileAvatar
              src={customer.profileImage}
              alt={customer.name}
              size={112}
            />

            <h3 className="mt-4 text-2xl font-semibold text-white">
              {customer.name}
            </h3>

            <p className="mt-1 text-[#F5A623]">{customer.customerId}</p>
          </div>

          {/* Details */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#F5A623]" />

                <div>
                  <p className="text-xs text-zinc-500">Email</p>

                  <p className="text-white">{customer.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#F5A623]" />

                <div>
                  <p className="text-xs text-zinc-500">Phone Number</p>

                  <p className="text-white">
                    {customer.phoneNumber || "Not Added"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 text-[#F5A623]" />

                <div>
                  <p className="text-xs text-zinc-500">Address</p>

                  <p className="text-white">
                    {customer.address || "No address added"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Joined */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs text-zinc-500">Joined Date</p>

            <p className="mt-1 text-white">
              {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-white/10 p-6">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-3 text-white"
          >
            Close
          </button>

          {customer.phoneNumber && (
            <a
              href={`tel:${customer.phoneNumber}`}
              className="rounded-2xl bg-[#F5A623] px-5 py-3 font-semibold text-black"
            >
              Contact Customer
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
