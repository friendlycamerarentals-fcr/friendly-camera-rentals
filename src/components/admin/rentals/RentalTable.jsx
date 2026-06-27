"use client";

import { useState } from "react";
import {
  Eye,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import RentalStatusBadge from "./RentalStatusBadge";

const PAGE_SIZE = 10;

const statusOptions = [
  { value: "Pending", color: "bg-yellow-500" },
  { value: "Approved", color: "bg-blue-500" },
  { value: "Rejected", color: "bg-red-500" },
  { value: "Completed", color: "bg-green-500" },
];

export default function RentalTable({
  bookings,
  onView,
  onStatusChange,
  onDelete,
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages); // clamp if filter shrinks results
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageRows = bookings.slice(startIndex, startIndex + PAGE_SIZE);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));
  const goFirst = () => goTo(1);
  const goLast = () => goTo(totalPages);

  // Build page number pills (max 5 visible)
  const getPageNumbers = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, 4, 5];
    if (safePage >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [safePage - 2, safePage - 1, safePage, safePage + 1, safePage + 2];
  };

  const updateStatus = (id, status) => onStatusChange?.(id, status);
  const deleteBooking = (id) => onDelete?.(id);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] text-sm">
          <thead className="border-b border-white/10 bg-black/40">
            <tr className="text-left text-sm text-zinc-400">
              <th className="px-6 py-3">Request ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Pickup</th>
              <th className="px-6 py-3">Qty</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageRows.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-white/5 transition hover:bg-white/[0.02]"
              >
                <td className="px-6 py-5">
                  <span className="font-semibold text-[#F5A623]">
                    {booking.requestId}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <p className="font-medium text-white">{booking.fullName}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {booking.email || "No email"}
                  </p>
                  {booking.customerId && (
                    <p className="mt-1 text-xs text-amber-400">
                      {booking.customerId}
                    </p>
                  )}
                </td>

                <td className="px-6 py-5 text-zinc-300">{booking.phone}</td>

                <td className="px-6 py-5 text-zinc-300">
                  <div className="flex items-center gap-2">
                    {booking.productImage ? (
                      <img
                        src={booking.productImage}
                        alt={booking.productName}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    ) : null}
                    <span className="line-clamp-1">{booking.productName}</span>
                  </div>
                </td>

                <td className="px-6 py-5 text-zinc-300">
                  {booking.bookingDate}
                </td>

                <td className="px-6 py-5 text-zinc-300">
                  {booking.pickupTime || "—"}
                </td>

                <td className="px-6 py-5 text-zinc-300">
                  {booking.quantity || 1}
                </td>

                <td className="px-6 py-5">
                  <span className="font-bold text-white">
                    ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <details className="relative">
                    <summary className="flex cursor-pointer list-none items-center gap-1.5">
                      <RentalStatusBadge status={booking.status} />
                      <ChevronDown size={13} className="text-zinc-500" />
                    </summary>

                    <div className="absolute left-0 top-10 z-50 w-52 rounded-2xl border border-white/10 bg-zinc-900 p-1.5 shadow-2xl">
                      {statusOptions.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => updateStatus(booking.id, s.value)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/5"
                        >
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.color}`}
                          />
                          <span className="flex-1 text-white">{s.value}</span>
                          {booking.status === s.value && (
                            <span className="text-[#F5A623]">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </details>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(booking)}
                      title="View details"
                      className="cursor-pointer rounded-xl border border-white/10 p-2 text-white transition hover:bg-white/10"
                    >
                      <Eye size={16} />
                    </button>
                    <a
                      href={`tel:${booking.phone}`}
                      title="Call"
                      className="rounded-xl border border-white/10 p-2 text-green-400 transition hover:bg-green-500/10"
                    >
                      <Phone size={16} />
                    </a>
                    <a
                      href={`https://wa.me/91${booking.phone}`}
                      target="_blank"
                      rel="noreferrer"
                      title="WhatsApp"
                      className="rounded-xl border border-white/10 p-2 text-green-500 transition hover:bg-green-500/10"
                    >
                      <MessageCircle size={16} />
                    </a>
                    <button
                      onClick={() => deleteBooking(booking.id)}
                      title="Delete"
                      className="rounded-xl border border-white/10 p-2 text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {bookings.length === 0 && (
          <div className="py-20 text-center text-zinc-500">
            No rental bookings found.
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {bookings.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
          {/* Result count */}
          <p className="text-xs text-zinc-500">
            Showing{" "}
            <span className="text-white">
              {startIndex + 1}–
              {Math.min(startIndex + PAGE_SIZE, bookings.length)}
            </span>{" "}
            of <span className="text-white">{bookings.length}</span> bookings
          </p>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* First */}
            <button
              onClick={goFirst}
              disabled={safePage === 1}
              title="First page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-[#F5A623]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              «
            </button>

            {/* Prev */}
            <button
              onClick={() => goTo(safePage - 1)}
              disabled={safePage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-[#F5A623]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((n) => (
              <button
                key={n}
                onClick={() => goTo(n)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition ${
                  n === safePage
                    ? "border-[#F5A623] bg-[#F5A623]/15 text-[#F5A623]"
                    : "border-white/10 text-zinc-400 hover:border-[#F5A623]/40 hover:text-white"
                }`}
              >
                {n}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => goTo(safePage + 1)}
              disabled={safePage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-[#F5A623]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>

            {/* Last */}
            <button
              onClick={goLast}
              disabled={safePage === totalPages}
              title="Last page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-[#F5A623]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
