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
  };

  const result = addRentalProductToCart([existingItem], {
    ...existingItem,
    duration: "1 Day",
    price: 1200,
  });

  assert.equal(result.added, false);
  assert.deepEqual(result.cart, [existingItem]);
});

test("adding a new rental product creates one cart line", () => {
  const product = { id: "camera-1", price: 500 };

  const result = addRentalProductToCart([], product);

  assert.equal(result.added, true);
  assert.deepEqual(result.cart, [product]);
});

test("normalizing a saved rental cart removes duplicate products", () => {
  const cart = normalizeRentalCart([
    { id: "camera-1", duration: "5 Hours" },
    { id: "camera-1", duration: "1 Day" },
    { id: "lens-1" },
  ]);

  assert.deepEqual(cart, [
    { id: "camera-1", duration: "5 Hours" },
    { id: "lens-1" },
  ]);
});
