"use client";

import {
  CalendarDays,
  Clock3,
  Gift,
  Phone,
  User,
  WalletCards,
  Camera,
  BadgePercent,
  X,
} from "lucide-react";

import RewardStatusBadge from "./RewardStatusBadge";
import { formatDate } from "@/lib/rewards/rewardHelpers";

export default function RewardDetailsModal({ open, onClose, reward }) {
  if (!open || !reward) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_0_60px_rgba(0,0,0,.45)]">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Reward Details</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Complete reward information
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}

        <div className="max-h-[70vh] space-y-8 overflow-y-auto p-8">
          {/* Reward Information */}

          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Reward Information
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InfoCard icon={Gift} label="Reward ID" value={reward.rewardId} />

              <InfoCard
                icon={BadgePercent}
                label="Reward"
                value={`${reward.rewardPercentage}% Discount`}
              />

              <InfoCard
                icon={CalendarDays}
                label="Generated Date"
                value={formatDate(reward.createdAt)}
              />

              <InfoCard
                icon={Clock3}
                label="Expiry Date"
                value={formatDate(reward.expireDate)}
              />
            </div>
          </div>

          {/* Customer */}

          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Customer Information
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InfoCard
                icon={User}
                label="Customer Name"
                value={reward.customerName}
              />

              <InfoCard
                icon={User}
                label="Customer ID"
                value={reward.customerId}
              />

              <InfoCard
                icon={Phone}
                label="Contact Number"
                value={reward.contactNumber || "-"}
              />

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
                  Reward Status
                </p>

                <RewardStatusBadge status={reward.status} />
              </div>
            </div>
          </div>

          {/* Rental */}

          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Rental Details
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InfoCard
                icon={Camera}
                label="Generated From Rental"
                value={reward.rentalRequestId || "-"}
              />

              <InfoCard
                icon={WalletCards}
                label="Applied Rental"
                value={reward.appliedRentalId || "-"}
              />

              <InfoCard
                icon={CalendarDays}
                label="Applied Date"
                value={reward.appliedDate || "-"}
              />

              <InfoCard
                icon={WalletCards}
                label="Discount Amount"
                value={reward.rewardAmount ? `₹${reward.rewardAmount}` : "-"}
              />
            </div>
          </div>

          {/* Timeline */}

          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Reward Timeline
            </h3>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <div className="space-y-5">
                <TimelineItem
                  title="Reward Generated"
                  date={reward.createdAt}
                />

                <TimelineItem
                  title={reward.status}
                  date={reward.appliedDate || reward.expireDate}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="flex justify-end border-t border-white/10 px-8 py-5">
          <button
            onClick={onClose}
            className="rounded-2xl bg-[#F5A623] px-8 py-3 font-semibold text-black transition hover:bg-[#FFB800]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ */

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-[#F5A623]/10 p-2">
          <Icon size={18} className="text-[#F5A623]" />
        </div>

        <p className="text-xs uppercase tracking-widest text-zinc-500">
          {label}
        </p>
      </div>

      <p className="break-all text-base font-semibold text-white">{value}</p>
    </div>
  );
}

/* ------------------------------ */

function TimelineItem({ title, date }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 h-3 w-3 rounded-full bg-[#F5A623]" />

      <div>
        <p className="font-medium text-white">{title}</p>

        <p className="mt-1 text-sm text-zinc-500">{date || "-"}</p>
      </div>
    </div>
  );
}
