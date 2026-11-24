import test from "node:test";
import assert from "node:assert/strict";
import { getRentalStats } from "./rentalStats.js";
import { getActiveRentalRequests } from "./rentalRequestQueries.js";

test("soft-deleted rentals are excluded from the active list and its stats", async () => {
  const storedRentals = [
    {
      id: "active",
      status: "Confirmed",
      paymentSummary: { totalVerifiedPayments: 600 },
    },
    {
      id: "deleted",
      status: "Pending",
      deletedAt: "2026-11-25T10:00:00Z",
      paymentSummary: { totalVerifiedPayments: 900 },
    },
  ];
  let listSql = "";
  const bookings = await getActiveRentalRequests(async (sql) => {
    listSql = sql;
    return storedRentals.filter((booking) => !booking.deletedAt);
  });
  const stats = getRentalStats(bookings);

  assert.match(listSql, /WHERE "deletedAt" IS NULL/);
  assert.deepEqual(bookings.map((booking) => booking.id), ["active"]);
  assert.equal(stats.totalBookings, 1);
  assert.equal(stats.confirmed, 1);
  assert.equal(stats.pending, 0);
  assert.equal(stats.revenue, 600);
});
