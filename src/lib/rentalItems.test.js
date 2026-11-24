import test from "node:test";
import assert from "node:assert/strict";
import {
  getRentalItemsTotal,
  resolveConfiguredRentalPrice,
  resolveCustomRentalItemPrice,
  validateAgreedRentalPrice,
  validateRentalQuantity,
} from "./rentalItems.js";

const camera = {
  pricing: {
    "1hr": 300,
    "5hrs": 500,
    "11hrs": 800,
    "24hrs": 1200,
  },
};

test("resolves configured duration pricing and permits a validated agreed price", () => {
  assert.deepEqual(resolveConfiguredRentalPrice(camera, "5hrs"), {
    ok: true,
    duration: { value: 5, unit: "Hours" },
    configuredPrice: 500,
    rentalPrice: 500,
    isCustomPrice: false,
  });
  assert.equal(
    resolveConfiguredRentalPrice(camera, "5hrs", "450").rentalPrice,
    450,
  );
  assert.equal(
    resolveConfiguredRentalPrice(camera, "5hrs", "450").isCustomPrice,
    true,
  );
  assert.deepEqual(resolveConfiguredRentalPrice(camera, "6hrs"), {
    ok: false,
    message: "The selected duration is not configured for this product.",
  });
  assert.equal(resolveConfiguredRentalPrice(camera, "5hrs", -1).ok, false);
});

test("validates quantities and sums item amounts with quantity", () => {
  assert.deepEqual(validateRentalQuantity("2"), { ok: true, value: 2 });
  assert.equal(validateRentalQuantity(0).ok, false);
  assert.equal(validateRentalQuantity(1.5).ok, false);
  assert.equal(
    getRentalItemsTotal([
      { rentalPrice: 300, quantity: 1 },
      { rentalPrice: 500, quantity: 2 },
    ]),
    1300,
  );
});

test("resolves custom rental durations and requires a valid duration and agreed price", () => {
  assert.deepEqual(
    resolveCustomRentalItemPrice({ value: "3", unit: "Days" }, "5000"),
    {
      ok: true,
      duration: { value: 3, unit: "Days" },
      durationDisplay: "3 Days",
      rentalPrice: 5000,
      isCustomDuration: true,
      isCustomPrice: true,
    },
  );
  assert.equal(
    resolveCustomRentalItemPrice({ value: "1", unit: "Hours" }, "250").durationDisplay,
    "1 Hour",
  );
  assert.equal(resolveCustomRentalItemPrice({ value: "", unit: "Days" }, "500").ok, false);
  assert.equal(resolveCustomRentalItemPrice({ value: "0", unit: "Days" }, "500").ok, false);
  assert.equal(resolveCustomRentalItemPrice({ value: "1.5", unit: "Hours" }, "500").ok, false);
  assert.equal(resolveCustomRentalItemPrice({ value: "3", unit: "Weeks" }, "500").ok, false);
  assert.equal(resolveCustomRentalItemPrice({ value: "3", unit: "Days" }, "0").ok, false);
  assert.equal(resolveCustomRentalItemPrice({ value: true, unit: "Days" }, "500").ok, false);
  assert.equal(resolveCustomRentalItemPrice({ value: "3", unit: "Days" }, "0.001").ok, false);
});

test("validates agreed prices against the existing item price limit", () => {
  assert.equal(validateAgreedRentalPrice(12.345).value, 12.35);
  assert.equal(validateAgreedRentalPrice(0).ok, false);
  assert.equal(validateAgreedRentalPrice(10_000_001).ok, false);
});
