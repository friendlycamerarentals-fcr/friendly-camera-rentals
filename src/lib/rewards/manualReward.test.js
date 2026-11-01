import test from "node:test";
import assert from "node:assert/strict";
import {
  getNextRewardId,
  validateManualRewardInput,
} from "./manualReward.js";
import { calculateExpiryDate, getManualRewardLifecycle } from "./rewardDates.js";
import {
  formatDate,
  formatRewardGeneratedDate,
} from "./rewardHelpers.js";

test("validates an existing customer, positive amount, and calendar date", () => {
  assert.deepEqual(
    validateManualRewardInput({
      customerRecordId: "customer-db-id",
      rewardAmount: "70",
      generatedAt: "2026-10-30",
    }),
    { ok: true, amount: 70 },
  );
  assert.equal(validateManualRewardInput({ rewardAmount: "70" }).ok, false);
  for (const rewardAmount of ["0", "-1", "1.234", "abc", "1e2"]) {
    assert.equal(
      validateManualRewardInput({
        customerRecordId: "customer-db-id",
        rewardAmount,
        generatedAt: "2026-10-30",
      }).ok,
      false,
    );
  }
  assert.equal(
    validateManualRewardInput({
      customerRecordId: "customer-db-id",
      rewardAmount: "70",
      generatedAt: "2026-02-30",
    }).ok,
    false,
  );
});

test("preserves historical date-only display and calculates expiry from it", () => {
  assert.equal(formatDate("2026-10-30"), "30 Oct 2026");
  assert.equal(
    calculateExpiryDate("2026-10-30").toISOString(),
    "2027-01-30T00:00:00.000Z",
  );
});

test("manual reward generated date never falls back to createdAt", () => {
  assert.equal(
    formatRewardGeneratedDate({
      source: "Manual",
      generatedDate: "2026-10-06",
      generatedAt: "2026-10-06T00:00:00.000Z",
      createdAt: "2026-11-01T00:00:00.000Z",
    }),
    "06 Oct 2026",
  );
  assert.equal(
    formatRewardGeneratedDate({
      source: "Manual",
      createdAt: "2026-11-01T00:00:00.000Z",
    }),
    "—",
  );
});

test("automatic reward generated date display behavior remains unchanged", () => {
  assert.equal(
    formatRewardGeneratedDate({
      rentalDate: "2026-10-06",
      createdAt: "2026-11-01T00:00:00.000Z",
    }),
    "06 Oct 2026",
  );
  assert.equal(
    formatRewardGeneratedDate({
      createdAt: "2026-11-01T00:00:00.000Z",
    }),
    formatDate("2026-11-01T00:00:00.000Z"),
  );
});

test("generates increasing FCR reward IDs and sets expired historical rewards", () => {
  assert.equal(getNextRewardId(undefined), "FCR-R100001");
  assert.equal(getNextRewardId("FCR-R100001"), "FCR-R100002");

  assert.deepEqual(
    getManualRewardLifecycle(
      new Date("2026-10-30T00:00:00.000Z"),
      new Date("2026-11-01T00:00:00.000Z"),
    ),
    {
      status: "Expired",
      expiredDate: new Date("2026-11-01T00:00:00.000Z"),
    },
  );
  assert.equal(
    getManualRewardLifecycle(
      new Date("2027-01-30T00:00:00.000Z"),
      new Date("2026-11-01T00:00:00.000Z"),
    ).status,
    "Active",
  );
});
