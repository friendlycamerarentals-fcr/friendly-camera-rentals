"use client";

import { useRef, useState } from "react";
import { X, Phone, Save, Trash2, BadgeCheck, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import RentalStatusBadge from "./RentalStatusBadge";
import { RENTAL_STATUS_TRANSITIONS } from "@/constants/rentalStatus";
import { openRentalWhatsApp } from "@/lib/whatsappBookingMessage";
import {
  RENTAL_PAYMENT_METHODS,
  RENTAL_PAYMENT_TYPES,
} from "@/lib/rentalPayment";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-[#F5A623] transition";
const labelCls = "mb-1 block text-[11px] text-zinc-400 truncate";

export default function RentalDetailsModal({
  open,
  onClose,
  booking,
  onStatusChange,
  onDelete,
  onSave,
  onRecordPayment,
  onWhatsApp,
  actionLoading,
}) {
  const [paymentEdit, setPaymentEdit] = useState(null);
  const [paymentForm, setPaymentForm] = useState(() => ({
    amount: "",
    paymentType: "Advance",
    method: "UPI",
  }));
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const paymentSubmitLock = useRef(false);
  const paymentSubmissionKey = useRef(null);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);
  const availableStatusTransitions =
    RENTAL_STATUS_TRANSITIONS[booking?.status] || [];

  if (!open || !booking) return null;

  const rewardDiscount = Number(booking.rewardDiscount || 0);
  const paymentBase = {
    totalRent: Number(
      booking.originalAmount ??
        Number(booking.totalAmount || 0) + rewardDiscount,
    ),
    otherDiscount: Number(booking.discount || 0),
  };
  const payment = {
    ...paymentBase,
    ...(paymentEdit?.bookingId === booking.id ? paymentEdit.values : {}),
  };
  const finalRent = Math.max(
    payment.totalRent - rewardDiscount - payment.otherDiscount,
    0,
  );
  const advanceExpected = Number(booking.advanceExpected || 0);
  const paymentHistory = booking.paymentHistory || [];
  const totalVerifiedPayments = Number(
    booking.paymentSummary?.totalVerifiedPayments ??
      paymentHistory
        .filter((entry) => entry.verified)
        .reduce((total, entry) => total + Number(entry.amount || 0), 0),
  );
  const advanceReceived = Number(
    booking.paymentSummary?.advanceReceived ?? booking.advanceAmount ?? 0,
  );
  const advanceVerified = booking.advanceVerified === true;
  const remainingAmount = Math.max(finalRent - totalVerifiedPayments, 0);
  const canConfirm = booking.status === "Pending";

  const handleWhatsApp = () => {
    if (onWhatsApp) {
      onWhatsApp(booking);
    } else {
      openRentalWhatsApp(booking);
    }
  };
  const handleCall = () => window.open(`tel:${booking.phone}`);

  const handleStatusAction = async (status) => {
    if (!onStatusChange || actionLoading) return;
    if (status === "Confirmed") {
      await handleConfirmRental();
      return;
    }
    await onStatusChange(booking.id, status);
  };

  const handleConfirmRental = async () => {
    if (!onStatusChange || confirmSubmitting) return;
    setConfirmSubmitting(true);
    try {
      await onStatusChange(booking.id, "Confirmed");
    } finally {
      setConfirmSubmitting(false);
    }
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
      discount: payment.otherDiscount,
    };

    const success = await onSave(booking.id, payload);
    if (success) {
      toast.success("Payment details updated successfully");
    }
  };

  const updatePayment = (field, value) => {
    setPaymentEdit((previous) => ({
      bookingId: booking.id,
      values: {
        ...(previous?.bookingId === booking.id ? previous.values : paymentBase),
        [field]: value,
      },
    }));
  };

  const submitPaymentRecord = async () => {
    if (!onRecordPayment || paymentSubmitting || paymentSubmitLock.current) return;
    const amount = Number(paymentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter the advance amount actually received.");
      return;
    }
    if (!paymentForm.method) {
      toast.error("Select the payment method.");
      return;
    }
    if (amount > remainingAmount) {
      toast.error(
        `Amount cannot exceed the remaining balance (₹${remainingAmount.toLocaleString("en-IN")}).`,
      );
      return;
    }

    paymentSubmitLock.current = true;
    setPaymentSubmitting(true);
    try {
      const submission = JSON.stringify({
        amount,
        paymentType: paymentForm.paymentType,
        method: paymentForm.method,
      });
      if (paymentSubmissionKey.current?.submission !== submission) {
        const storageKey = `rental-payment:${booking.id}`;
        let storedSubmission = null;
        try {
          storedSubmission = JSON.parse(
            window.sessionStorage.getItem(storageKey) || "null",
          );
        } catch {
          window.sessionStorage.removeItem(storageKey);
        }
        const retryKey =
          storedSubmission?.submission === submission
            ? storedSubmission.idempotencyKey
            : globalThis.crypto.randomUUID();
        paymentSubmissionKey.current = {
          submission,
          idempotencyKey: retryKey,
        };
        window.sessionStorage.setItem(
          storageKey,
          JSON.stringify(paymentSubmissionKey.current),
        );
      }
      const success = await onRecordPayment(booking.id, {
        amount,
        paymentType: paymentForm.paymentType,
        method: paymentForm.method,
        idempotencyKey: paymentSubmissionKey.current.idempotencyKey,
      });
      if (success) {
        paymentSubmissionKey.current = null;
        window.sessionStorage.removeItem(`rental-payment:${booking.id}`);
        setPaymentForm({
          amount: "",
          paymentType: paymentForm.paymentType,
          method: paymentForm.method,
        });
      }
      return success;
    } finally {
      paymentSubmitLock.current = false;
      setPaymentSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_0_60px_rgba(245,166,35,0.10)] sm:rounded-2xl sm:max-w-140 lg:max-w-180 xl:max-w-205"
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
          <div className="flex items-center gap-2">
            {booking.bookingSource && (
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                {booking.bookingSource === "Manual" ? "Manual Booking" : "Website Booking"}
              </span>
            )}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-full p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
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
                    <FaWhatsapp size={15} />
                    {booking.status === "Confirmed" ? "Confirmation Message" : "Request Status Message"}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-zinc-500">
                  {booking.status === "Confirmed"
                    ? "Opens WhatsApp with the confirmed-booking message."
                    : "Opens WhatsApp with the request-received status. The message is prefilled — press Send to deliver it."}
                </p>
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
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-zinc-500">Source:</dt>
                    <dd className="text-zinc-200">
                      {booking.bookingSource || "Website"}
                      {booking.createdByAdmin
                        ? ` · by ${booking.createdByAdmin}`
                        : ""}
                    </dd>
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
              {booking.items?.length ? (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-black/40 text-zinc-400">
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide">Rental item</th>
                        <th className="px-2 py-2 text-left text-[11px] font-medium uppercase tracking-wide">Duration</th>
                        <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide">Agreed price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.items.map((item) => (
                        <tr key={item.id} className="border-t border-white/5">
                          <td className="px-3 py-2.5 text-white">
                            {item.productName}
                            {item.category && (
                              <span className="ml-2 text-[11px] text-zinc-500">({item.category})</span>
                            )}
                          </td>
                          <td className="px-2 py-2.5 text-zinc-400">
                            {item.durationDisplay || "—"}
                            {(item.isCustomDuration || item.isCustomPrice) && (
                              <span className="ml-1.5 rounded bg-[#F5A623]/15 px-1 py-0.5 text-[10px] text-[#F5A623]">Custom</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-[#F5A623]">
                            ₹{Number(item.rentalPrice || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/10 bg-black/40">
                        <td className="px-3 py-2 text-zinc-300" colSpan={2}>Total before reward</td>
                        <td className="px-3 py-2 text-right font-bold text-white">
                          ₹{Number(booking.originalAmount ?? finalRent + rewardDiscount).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
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
                    <div className="shrink-0 text-right">
                      <span className="block text-sm font-bold text-[#F5A623]">
                        ₹
                        {Number(finalRent).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-zinc-500">Final payable</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Management */}
            <div className="rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#F5A623]">
                Payment Management
              </h3>

              {/* Inputs for rental amount / other discount */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>
                    Original Amount (before discount)
                  </label>
                  <input
                    type="number"
                    value={payment.totalRent}
                    min="0"
                    step="0.01"
                    onChange={(e) =>
                      updatePayment("totalRent", Number(e.target.value))
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Other Discount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={payment.otherDiscount}
                    onChange={(e) =>
                      updatePayment("otherDiscount", Number(e.target.value))
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                <span className="text-zinc-400">
                  Reward Discount
                  {booking.rewardId ? ` · ${booking.rewardId}` : ""}
                </span>
                <span className="font-semibold text-emerald-400">
                  -₹{rewardDiscount.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Summary cards */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-500">Final Rent</p>
                  <p className="mt-1.5 text-xl font-bold text-white sm:text-2xl">
                    ₹{finalRent.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-500">Advance Expected</p>
                  <p className="mt-1.5 text-xl font-bold text-zinc-300 sm:text-2xl">
                    ₹{advanceExpected.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-500">
                    Advance Received{" "}
                    {advanceVerified ? (
                      <BadgeCheck size={14} className="inline text-green-400" />
                    ) : null}
                  </p>
                  <p
                    className={`mt-1.5 text-xl font-bold sm:text-2xl ${
                      advanceVerified ? "text-green-400" : "text-zinc-500"
                    }`}
                  >
                    ₹{advanceReceived.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-500">Remaining</p>
                  <p className="mt-1.5 text-xl font-bold text-[#F5A623] sm:text-2xl">
                    ₹{remainingAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-500">Total Payments</p>
                  <p className="mt-1.5 text-xl font-bold text-zinc-200 sm:text-2xl">
                    ₹{totalVerifiedPayments.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {advanceVerified && (
                <p className="mt-2 text-[11px] text-green-400/80">
                  ✓ Verified by {booking.advanceVerifiedBy || "admin"}
                  {booking.advanceVerifiedAt
                    ? ` on ${new Date(booking.advanceVerifiedAt).toLocaleString()}`
                    : ""}
                  {booking.advancePaymentMethod
                    ? ` · ${booking.advancePaymentMethod}`
                    : ""}
                  {booking.advancePaymentRef
                    ? ` · Ref: ${booking.advancePaymentRef}`
                    : ""}
                </p>
              )}
              {!advanceVerified && advanceExpected > 0 && (
                <p className="mt-2 text-[11px] text-zinc-500">
                  An advance of ₹{advanceExpected.toLocaleString("en-IN")} was
                  expected but not yet recorded as received. It does not count
                  as paid.
                </p>
              )}

              <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                <div className="border-b border-white/10 px-3 py-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Payment History
                  </h4>
                </div>
                {paymentHistory.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                      <thead className="bg-zinc-900 text-left text-[11px] uppercase tracking-wide text-zinc-500">
                        <tr>
                          <th className="px-3 py-2">Type</th>
                          <th className="px-3 py-2">Amount</th>
                          <th className="px-3 py-2">Method</th>
                          <th className="px-3 py-2">Reference</th>
                          <th className="px-3 py-2">Verification</th>
                          <th className="px-3 py-2">Recorded</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((entry) => (
                          <tr
                            key={entry.id}
                            className="border-t border-white/5 text-zinc-300"
                          >
                            <td className="px-3 py-2">{entry.paymentType}</td>
                            <td className="px-3 py-2 font-semibold text-white">
                              ₹{Number(entry.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="px-3 py-2">{entry.method || "—"}</td>
                            <td className="px-3 py-2">{entry.reference || "—"}</td>
                            <td
                              className={`px-3 py-2 ${
                                entry.verified
                                  ? "text-green-400"
                                  : "text-amber-400"
                              }`}
                            >
                              {entry.verified
                                ? `Verified${entry.verifiedBy ? ` by ${entry.verifiedBy}` : ""}`
                                : "Not verified"}
                            </td>
                            <td className="px-3 py-2">
                              {entry.verifiedAt || entry.createdAt
                                ? new Date(
                                    entry.verifiedAt || entry.createdAt,
                                  ).toLocaleString("en-IN")
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="px-3 py-3 text-xs text-zinc-500">
                    No payment transactions recorded.
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400 cursor-pointer disabled:opacity-60"
                >
                  <Save size={16} />
                  Save Amount Details
                </button>
                <span className="text-[11px] text-zinc-500">
                  Amount changes cannot modify the recorded advance.
                </span>
              </div>

              {/* Record verified advance payment */}
              <div className="mt-4 rounded-xl border border-white/10 bg-zinc-900/50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Record Payment
                </p>
                <p className="mb-3 text-xs text-[#F5A623]">
                  Outstanding balance: ₹{remainingAmount.toLocaleString("en-IN")}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                  <div>
                    <label className={labelCls}>Payment type</label>
                    <select
                      value={paymentForm.paymentType}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          paymentType: e.target.value,
                        }))
                      }
                      className={inputCls}
                    >
                      {RENTAL_PAYMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Amount received</label>
                    <input
                      type="number"
                      min="0"
                      max={remainingAmount}
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Method</label>
                    <select
                      value={paymentForm.method}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          method: e.target.value,
                        }))
                      }
                      className={inputCls}
                    >
                      {RENTAL_PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={submitPaymentRecord}
                      disabled={
                        paymentSubmitting ||
                        actionLoading ||
                        remainingAmount <= 0
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {paymentSubmitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Recording...
                        </>
                      ) : (
                        `Record ${paymentForm.paymentType}`
                      )}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-zinc-500">
                  Recording a payment verifies that money was actually
                  received. Each advance or balance payment is stored separately.
                </p>
              </div>
            </div>

            {/* Status actions */}
            <div className="rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#F5A623]">
                Actions
              </h3>

              {booking.status === "Pending" && (
                <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                  <p className="mb-2 text-xs text-zinc-400">
                    The rental can be confirmed with or without an advance.
                    Only recorded payments reduce the remaining balance.
                  </p>
                  <button
                    onClick={handleConfirmRental}
                    disabled={!canConfirm || confirmSubmitting || actionLoading}
                    title={
                      canConfirm
                        ? "Confirm this rental with or without an advance"
                        : "Confirm this rental"
                    }
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {confirmSubmitting || actionLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Working...
                      </>
                    ) : (
                      <>
                        <BadgeCheck size={16} />
                        Confirm Rental
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {availableStatusTransitions
                  .filter((status) => status !== "Confirmed")
                  .map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusAction(status)}
                      disabled={actionLoading}
                      className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 disabled:opacity-60"
                    >
                      Mark {status}
                    </button>
                  ))}
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
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
