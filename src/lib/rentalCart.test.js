import assert from "node:assert/strict";
import test from "node:test";
import {
  addRentalProductToCart,
  normalizeRentalCart,
} from "./rentalCart.js";

test("adding a product already in the rental cart leaves it unchanged", () => {
  const existingItem = {
    id: "camera-1",
    name: "Canon EOS 80D",
    duration: "5 Hours",
    price: 500,
    quantity: 1,
  };

  const result = addRentalProductToCart([existingItem], {
    ...existingItem,
    duration: "1 Day",
    price: 1200,
  });

  assert.equal(result.added, false);
  assert.deepEqual(result.cart, [existingItem]);
});

test("adding a new rental product always starts at quantity one", () => {
  const result = addRentalProductToCart([], {
    id: "camera-1",
    quantity: 2,
  });

  assert.equal(result.added, true);
  assert.deepEqual(result.cart, [{ id: "camera-1", quantity: 1 }]);
});

test("normalizing a saved rental cart resets quantity and removes duplicate products", () => {
  const cart = normalizeRentalCart([
    { id: "camera-1", duration: "5 Hours", quantity: 2 },
    { id: "camera-1", duration: "1 Day", quantity: 1 },
    { id: "lens-1", quantity: 3 },
  ]);

  assert.deepEqual(cart, [
    { id: "camera-1", duration: "5 Hours", quantity: 1 },
    { id: "lens-1", quantity: 1 },
  ]);
});
