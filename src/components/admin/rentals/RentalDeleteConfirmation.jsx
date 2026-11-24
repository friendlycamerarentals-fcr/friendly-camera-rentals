"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { dismissRentalDeleteConfirmation } from "@/lib/rentalDeleteConfirmation";

const formatMoney = (value) => Number(value || 0).toLocaleString("en-IN");

function hasUpcomingConfirmedPickup(booking) {
  if (booking.status !== "Confirmed") return false;
  const dateValue = String(booking.bookingDate || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return true;

  const pickupDate = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(pickupDate.getTime()) && pickupDate >= today;
}

export default function RentalDeleteConfirmation({
  booking,
  paymentTotal = 0,
  deleting,
  error,
  onCancel,
  onConfirm,
}) {
  const cancelRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  const bookingId = booking?.id;

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!bookingId) return;
    cancelRef.current?.focus();
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) return;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      if (deleting) return;
      dismissRentalDeleteConfirmation({
        deleting,
        onCancel: onCancelRef.current,
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bookingId, deleting]);

  if (!booking || typeof document === "undefined") return null;

  const upcomingPickup = hasUpcomingConfirmedPickup(booking);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          dismissRentalDeleteConfirmation({ deleting, onCancel });
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-rental-title"
        aria-describedby="delete-rental-warning"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-[0_0_60px_rgba(0,0,0,0.65)]"
      >
        <h2 id="delete-rental-title" className="text-lg font-bold text-white">
          Delete rental booking?
        </h2>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl border border-white/10 bg-zinc-900 p-3 text-sm">
          <dt className="text-zinc-500">Request ID</dt>
          <dd className="text-right font-medium text-[#F5A623]">
            {booking.requestId || "—"}
          </dd>
          <dt className="text-zinc-500">Customer</dt>
          <dd className="text-right text-zinc-200">{booking.fullName || "—"}</dd>
          <dt className="text-zinc-500">Product</dt>
          <dd className="text-right text-zinc-200">
            {booking.productName || "—"}
          </dd>
          <dt className="text-zinc-500">Date</dt>
          <dd className="text-right text-zinc-200">
            {booking.bookingDate || "—"}
          </dd>
          <dt className="text-zinc-500">Pickup time</dt>
          <dd className="text-right text-zinc-200">
            {booking.pickupTime || "—"}
          </dd>
          <dt className="text-zinc-500">Total</dt>
          <dd className="text-right font-semibold text-white">
            ₹{formatMoney(booking.totalAmount)}
          </dd>
          <dt className="text-zinc-500">Status</dt>
          <dd className="text-right text-zinc-200">{booking.status || "—"}</dd>
        </dl>

        <p
          id="delete-rental-warning"
          className="mt-4 text-sm leading-6 text-amber-300"
        >
          This will remove this rental booking. This action cannot be undone.
        </p>

        {paymentTotal > 0 && (
          <p className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm leading-6 text-red-200">
            This booking has ₹{formatMoney(paymentTotal)} in recorded payments.
            Deleting it will remove the booking and its payment history from the
            admin panel.
          </p>
        )}

        {upcomingPickup && (
          <p className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-sm leading-6 text-amber-200">
            This confirmed booking has a future pickup date. Verify the
            reservation is no longer needed before deleting it.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={() =>
              dismissRentalDeleteConfirmation({ deleting, onCancel })
            }
            disabled={deleting}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Rental"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
