import test from "node:test";
import assert from "node:assert/strict";
import {
  getDurationListingPrice,
  updatePricesForSharedDuration,
  validateSharedRentalDuration,
} from "./rentalDuration.js";

test("validates a shared standard or custom rental duration once", () => {
  assert.deepEqual(validateSharedRentalDuration({ type: "standard", key: "3days" }), {
    ok: true,
    duration: {
      type: "standard",
      key: "3days",
      value: 3,
      unit: "Days",
      display: "3 Days",
    },
  });

  assert.deepEqual(
    validateSharedRentalDuration({
      type: "custom",
      customValue: 12,
      customUnit: "Hours",
    }),
    {
      ok: true,
      duration: {
        type: "custom",
        value: 12,
        unit: "Hours",
        display: "12 Hours",
      },
    },
  );

  assert.equal(validateSharedRentalDuration({ type: "standard", key: "overnight" }).ok, false);
  assert.equal(
    validateSharedRentalDuration({ type: "custom", customValue: 0, customUnit: "Days" }).ok,
    false,
  );
  assert.equal(
    validateSharedRentalDuration({ type: "custom", customValue: 1, customUnit: "Weeks" }).ok,
    false,
  );
  assert.equal(validateSharedRentalDuration({}).ok, false);
});

test("shared duration changes refresh catalog prices and preserve negotiated prices", () => {
  const productsById = {
    camera: { id: "camera", pricing: { "1day": 500, "3days": 1200 } },
    lens: { id: "lens", pricing: { "1day": 200, "3days": 450 } },
  };
  const items = [
    { productId: "camera", price: "500", priceCustom: false },
    { productId: "lens", price: "175", priceCustom: true },
  ];

  assert.deepEqual(
    updatePricesForSharedDuration(items, productsById, {
      type: "standard",
      key: "3days",
    }),
    [
      { productId: "camera", price: "1200", priceCustom: false },
      { productId: "lens", price: "175", priceCustom: true },
    ],
  );
  assert.equal(
    getDurationListingPrice(productsById.camera, { type: "standard", key: "3days" }),
    "1200",
  );
  assert.equal(
    getDurationListingPrice(productsById.camera, {
      type: "custom",
      customValue: 4,
      customUnit: "Days",
    }),
    "",
  );
});
