import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRecentActivities,
  isSoldStatusTransition,
} from "./adminActivity.js";

test("aggregates activities newest first and limits the feed to ten", () => {
  const rentals = Array.from({ length: 12 }, (_, index) => ({
    id: `rental-${index}`,
    requestId: `FCR-${index}`,
    fullName: "Customer",
    productName: "Camera",
    createdAt: new Date(Date.UTC(2026, 0, index + 1)),
  }));
  const activities = buildRecentActivities({ rentals });

  assert.equal(activities.length, 10);
  assert.equal(activities[0].relatedId, "FCR-11");
  assert.equal(activities[9].relatedId, "FCR-2");
});

test("includes pending testimonials and excludes approved and rejected ones", () => {
  const activities = buildRecentActivities({
    testimonials: [
      {
        id: "pending",
        name: "Customer",
        status: "pending",
        createdAt: "2026-11-03T08:00:00.000Z",
      },
      {
        id: "approved",
        name: "Customer",
        status: "approved",
        createdAt: "2026-11-03T09:00:00.000Z",
      },
      {
        id: "rejected",
        name: "Customer",
        status: "rejected",
        createdAt: "2026-11-03T10:00:00.000Z",
      },
    ],
  });

  assert.deepEqual(
    activities.map((activity) => activity.relatedId),
    ["pending"],
  );
});

test("merges activity types and omits entries with invalid timestamps", () => {
  const activities = buildRecentActivities({
    rentals: [
      {
        id: "rental",
        requestId: "FCR-R100123",
        fullName: "Kishore",
        productName: "Sony A7 IV",
        createdAt: "2026-11-03T10:30:00.000Z",
      },
      { id: "bad-rental", createdAt: "invalid" },
    ],
    sellRequests: [
      {
        id: "sell",
        fullName: "Customer",
        brand: "Sony",
        model: "Lens",
        createdAt: "2026-11-03T09:30:00.000Z",
      },
    ],
    soldProducts: [
      {
        id: "sold-event",
        productId: "product",
        productName: "Camera",
        occurredAt: "2026-11-03T09:00:00.000Z",
      },
    ],
  });

  assert.deepEqual(
    activities.map(({ type }) => type),
    ["rental_booking", "sell_request", "product_sold"],
  );
  assert.equal(activities[0].description, "Booking FCR-R100123 · Kishore booked Sony A7 IV");
  assert.equal(activities[0].timestamp, "2026-11-03T10:30:00.000Z");
});

test("records only transitions from a non-sold status to Sold", () => {
  assert.equal(isSoldStatusTransition("In Stock", "Sold"), true);
  assert.equal(isSoldStatusTransition("Out of Stock", "sold"), true);
  assert.equal(isSoldStatusTransition("Sold", "Sold"), false);
  assert.equal(isSoldStatusTransition("sold", "In Stock"), false);
});
