"use client";

import { useEffect, useState } from "react";
import { X, Phone, MessageCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import RentalStatusBadge from "./RentalStatusBadge";

export default function RentalDetailsModal({
  open,
  onClose,
  booking,
  onStatusChange,
  onDelete,
  onSave,
}) {
  const [payment, setPayment] = useState({
    totalRent: 0,
    discount: 0,
    advancePaid: 0,
  });

  useEffect(() => {
    if (booking) {
      setPayment({
        totalRent: booking.totalAmount || 0,
        discount: booking.discount || 0,
        advancePaid: booking.advanceAmount || 0,
      });
    }
  }, [booking]);

  if (!open || !booking) return null;

  const finalRent = payment.totalRent - payment.discount;
  const remainingAmount = finalRent - payment.advancePaid;

  const handleWhatsApp = () =>
    window.open(`https://wa.me/91${booking.phone}`, "_blank");
  const handleCall = () => window.open(`tel:${booking.phone}`);

  const handleStatusAction = async (status) => {
    if (!onStatusChange) return;
    await onStatusChange(booking.id, status);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    await onDelete(booking.id);
    onClose();
  };

  const handleSave = async () => {
    if (!onSave) return;

    const payload = {
      totalAmount: payment.totalRent,
      discount: payment.discount,
      advanceAmount: payment.advancePaid,
    };

    const success = await onSave(booking.id, payload);
    if (success) {
      toast.success("Payment updated successfully");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-[#F5A623] transition";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          flex max-h-[90vh] w-full flex-col overflow-hidden
          rounded-2xl border border-white/10 bg-zinc-950
          shadow-[0_0_60px_rgba(245,166,35,0.10)]
          sm:rounded-2xl
          sm:max-w-[560px]
          lg:max-w-[720px]
          xl:max-w-[820px]
        "
      >
        {/* ── Sticky header ─────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
              Rental Details
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400 sm:text-sm">
              Request ID: {booking.requestId}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable body ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5">
          <div className="space-y-4">
            {/* Customer + Booking */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Customer */}
              <div className="rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#F5A623]">
                  Customer Details
                </h3>
                <dl className="space-y-1.5 text-sm">
                  {[
                    ["Customer ID", booking.customerId || "—"],
                    ["Name", booking.fullName],
                    ["Phone", booking.phone],
                    ["Email", booking.email || "Not provided"],
                    ["Address", booking.address || "Not provided"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex flex-wrap gap-x-2">
                      <dt className="text-zinc-500">{label}:</dt>
                      <dd className="text-zinc-200 break-all">{val || "—"}</dd>
                    </div>
                  ))}
                </dl>

                {/* Action buttons */}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleCall}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5 cursor-pointer"
                  >
                    <Phone size={15} />
                    Call
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm text-white transition hover:bg-green-700 cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Booking */}
              <div className="rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#F5A623]">
                  Booking Details
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-zinc-500">Request ID:</dt>
                    <dd className="text-zinc-200">{booking.requestId}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-zinc-500">Booking Date:</dt>
                    <dd className="text-zinc-200">{booking.bookingDate}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-zinc-500">Pickup Time:</dt>
                    <dd className="text-zinc-200">
                      {booking.pickupTime || "—"}
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-zinc-500">Duration:</dt>
                    <dd className="text-zinc-200">{booking.rentalDuration}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-zinc-500">Quantity:</dt>
                    <dd className="text-zinc-200">{booking.quantity || 1}</dd>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2">
                    <dt className="text-zinc-500">Status:</dt>
                    <dd>
                      <RentalStatusBadge status={booking.status} />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Rental Products */}
            <div className="rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#F5A623]">
                Rental Products
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {booking.productName}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Duration: {booking.rentalDuration}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-[#F5A623]">
                    ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Management */}
            <div className="rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#F5A623]">
                Payment Management
              </h3>

              {/* Inputs */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] text-zinc-400 truncate">
                    Total Rent
                  </label>
                  <input
                    type="number"
                    value={payment.totalRent}
                    onChange={(e) =>
                      setPayment((p) => ({
                        ...p,
                        totalRent: Number(e.target.value),
                      }))
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-zinc-400 truncate">
                    Discount
                  </label>
                  <input
                    type="number"
                    value={payment.discount}
                    onChange={(e) =>
                      setPayment((p) => ({
                        ...p,
                        discount: Number(e.target.value),
                      }))
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-zinc-400 truncate">
                    Advance Paid
                  </label>
                  <input
                    type="number"
                    value={payment.advancePaid}
                    onChange={(e) =>
                      setPayment((p) => ({
                        ...p,
                        advancePaid: Number(e.target.value),
                      }))
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Summary cards */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-500">Final Rent</p>
                  <p className="mt-1.5 text-xl font-bold text-white sm:text-2xl">
                    ₹{finalRent.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-500">Advance Paid</p>
                  <p className="mt-1.5 text-xl font-bold text-green-400 sm:text-2xl">
                    ₹{payment.advancePaid.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-500">Remaining</p>
                  <p className="mt-1.5 text-xl font-bold text-[#F5A623] sm:text-2xl">
                    ₹{remainingAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="mt-4 flex items-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400 cursor-pointer"
              >
                <Save size={16} />
                Save Payment
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#F5A623]">
                Actions
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Pending", "Approved", "Rejected", "Completed"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusAction(status)}
                      className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
                    >
                      Mark {status}
                    </button>
                  ),
                )}
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>

            {booking.notes && (
              <div className="rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#F5A623]">
                  Notes
                </h3>
                <p className="text-sm text-zinc-300">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
