export function getRentalStats(bookings = []) {
  const activeBookings = (Array.isArray(bookings) ? bookings : []).filter(
    (booking) => !booking.deletedAt,
  );

  return {
    totalBookings: activeBookings.length,
    pending: activeBookings.filter((booking) => booking.status === "Pending")
      .length,
    confirmed: activeBookings.filter(
      (booking) => booking.status === "Confirmed",
    ).length,
    completed: activeBookings.filter(
      (booking) => booking.status === "Completed",
    ).length,
    cancelled: activeBookings.filter(
      (booking) => booking.status === "Cancelled",
    ).length,
    rejected: activeBookings.filter((booking) => booking.status === "Rejected")
      .length,
    revenue: activeBookings.reduce(
      (sum, booking) =>
        sum +
        Number(
          booking.paymentSummary?.totalVerifiedPayments ??
            booking.advanceAmount ??
            0,
        ),
      0,
    ),
  };
}
