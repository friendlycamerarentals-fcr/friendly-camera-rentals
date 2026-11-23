import test from "node:test";
import assert from "node:assert/strict";
import {
  getRentalItemsTotal,
  resolveConfiguredRentalPrice,
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
  assert.equal(resolveConfiguredRentalPrice(camera, "6hrs").ok, false);
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

test("validates agreed prices against the existing item price limit", () => {
  assert.equal(validateAgreedRentalPrice(12.345).value, 12.35);
  assert.equal(validateAgreedRentalPrice(0).ok, false);
  assert.equal(validateAgreedRentalPrice(10_000_001).ok, false);
});
