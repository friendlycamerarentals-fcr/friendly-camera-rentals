"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const STATUS_STYLES = {
  Pending: {
    line: "#F5A623",
    soft: "rgba(245, 166, 35, 0.14)",
    label: "Rental Request",
  },
  Confirmed: {
    line: "#60A5FA",
    soft: "rgba(96, 165, 250, 0.15)",
    label: "Confirmed",
  },
  Completed: {
    line: "#22C55E",
    soft: "rgba(34, 197, 94, 0.15)",
    label: "Completed",
  },
  Cancelled: {
    line: "#F87171",
    soft: "rgba(248, 113, 113, 0.14)",
    label: "Cancelled",
  },
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatMoney(value) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function getMonthMatrix(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push({ day: null, key: `empty-${i}` });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({ day, key: `day-${year}-${month}-${day}` });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: null, key: `empty-end-${cells.length}` });
  }

  return cells;
}

function mapBookingsByDate(bookings) {
  return bookings.reduce((acc, booking) => {
    const bookingDate = booking.bookingDate || booking.createdAt;
    if (!bookingDate) return acc;

    const normalized = new Date(bookingDate);
    if (Number.isNaN(normalized.getTime())) return acc;

    const key = new Date(
      normalized.getFullYear(),
      normalized.getMonth(),
      normalized.getDate(),
    ).toISOString();

    if (!acc[key]) acc[key] = [];
    acc[key].push(booking);
    return acc;
  }, {});
}

export default function BookingsPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/rental-requests");
        const result = await response.json();

        if (result.success) {
          setBookings(result.data || []);
        } else {
          throw new Error(result.message || "Failed to fetch bookings");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const monthCellData = useMemo(
    () => getMonthMatrix(currentMonth),
    [currentMonth],
  );
  const bookingsByDate = useMemo(() => mapBookingsByDate(bookings), [bookings]);

  const monthLabel = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToPreviousMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );

  const goToNextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );

  const goToToday = () => {
    const next = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonth(next);
    setSelectedDate(new Date(today));
  };

  const selectedDateKey = selectedDate
    ? new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      ).toISOString()
    : null;

  const selectedBookings = selectedDateKey
    ? bookingsByDate[selectedDateKey] || []
    : [];

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(
      new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    );
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Bookings</h1>
        <p className="mt-2 text-zinc-400">View and manage rental bookings</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3 md:justify-start">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-zinc-200 transition hover:bg-white/10"
              aria-label="Previous month"
            >
              ←
            </button>

            <h2 className="min-w-[170px] text-center text-xl font-semibold text-white md:text-2xl">
              {monthLabel}
            </h2>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-zinc-200 transition hover:bg-white/10"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <button
            type="button"
            onClick={goToToday}
            className="inline-flex items-center justify-center rounded-xl border border-[#F5A623]/40 bg-[#F5A623]/10 px-3 py-2 text-sm font-medium text-[#F5A623] transition hover:bg-[#F5A623]/15"
          >
            Today
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 md:justify-end">
          {Object.entries(STATUS_STYLES).map(([key, config]) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5"
            >
              <span
                className="h-1.5 w-5 rounded-full"
                style={{ backgroundColor: config.line }}
              />
              <span className="text-xs text-zinc-300">{config.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-7 gap-1 border border-white/10 bg-black/20 p-1.5 md:gap-1.5 md:p-2">
          {weekdayLabels.map((day) => (
            <div
              key={day}
              className="flex h-10 items-center justify-center border-b border-white/10 text-xs font-medium uppercase tracking-[0.12em] text-zinc-400 md:h-12"
            >
              {day}
            </div>
          ))}

          {monthCellData.map((cell) => {
            if (!cell.day) {
              return (
                <div
                  key={cell.key}
                  className="h-20 border border-white/5 bg-transparent md:h-24"
                />
              );
            }

            const isCurrentMonth =
              cell.day &&
              currentMonth.getMonth() ===
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  cell.day,
                ).getMonth();
            const isToday =
              today.getFullYear() === currentMonth.getFullYear() &&
              today.getMonth() === currentMonth.getMonth() &&
              today.getDate() === cell.day;

            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              cell.day,
            );
            const dateKey = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
            ).toISOString();
            const dayBookings = bookingsByDate[dateKey] || [];
            const selected =
              selectedDate &&
              selectedDate.getFullYear() === date.getFullYear() &&
              selectedDate.getMonth() === date.getMonth() &&
              selectedDate.getDate() === cell.day;

            return (
              <button
                type="button"
                key={cell.key}
                onClick={() => handleDateClick(date)}
                className={`relative flex h-20 flex-col items-center justify-start border p-1 text-left transition md:h-24 ${
                  selected
                    ? "border-[#F5A623]/60 bg-[#F5A623]/10"
                    : "border-white/5 bg-zinc-950/70 hover:bg-white/5"
                } ${!isCurrentMonth ? "opacity-40" : ""}`}
              >
                <span
                  className={`mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium md:text-base ${
                    isToday ? "bg-[#F5A623] text-black" : "text-zinc-200"
                  } ${selected && !isToday ? "bg-white/10 text-white" : ""}`}
                >
                  {cell.day}
                </span>

                <div className="mt-1 flex w-full items-center justify-center gap-1 px-1">
                  {dayBookings.slice(0, 3).map((booking) => {
                    const status =
                      STATUS_STYLES[booking.status] || STATUS_STYLES.Pending;
                    return (
                      <span
                        key={`${dateKey}-${booking.id}`}
                        className="h-1.5 w-3 rounded-full"
                        style={{ backgroundColor: status.line }}
                        title={`${booking.status}: ${booking.requestId || booking.id}`}
                      />
                    );
                  })}
                </div>

                {dayBookings.length > 3 && (
                  <span className="mt-1 text-[10px] text-zinc-500">
                    +{dayBookings.length - 3}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">
              {selectedDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
              {selectedBookings.length} booking
              {selectedBookings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {selectedBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/3 px-4 py-8 text-center text-sm text-zinc-400">
              No rental bookings for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedBookings.map((booking) => {
                const statusStyle =
                  STATUS_STYLES[booking.status] || STATUS_STYLES.Pending;

                return (
                  <div
                    key={booking.id}
                    className="rounded-xl border border-white/10 bg-zinc-950/80 p-3 md:p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {booking.requestId || "Rental Request"}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {booking.fullName}
                        </p>
                      </div>

                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]"
                        style={{
                          backgroundColor: statusStyle.soft,
                          color: statusStyle.line,
                        }}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
                      <div>
                        <span className="text-zinc-500">Phone:</span>{" "}
                        {booking.phone || "-"}
                      </div>
                      <div>
                        <span className="text-zinc-500">Product:</span>{" "}
                        {booking.productName || "-"}
                      </div>
                      <div>
                        <span className="text-zinc-500">Pickup:</span>{" "}
                        {booking.pickupTime || "-"}
                      </div>
                      <div>
                        <span className="text-zinc-500">Rental Date:</span>{" "}
                        {booking.bookingDate || "-"}
                      </div>
                      <div>
                        <span className="text-zinc-500">Quantity:</span>{" "}
                        {booking.quantity || 0}
                      </div>
                      <div>
                        <span className="text-zinc-500">Total:</span>{" "}
                        {formatMoney(booking.totalAmount)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
