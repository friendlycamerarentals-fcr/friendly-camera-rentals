import assert from "node:assert/strict";
import test from "node:test";
import {
  mergePackageIncludes,
  normalizePackageIncludes,
  validatePackageIncludes,
} from "./packageIncludes.js";

test("normalizes absent, empty, JSON-string, and blank-name input", () => {
  assert.deepEqual(normalizePackageIncludes(null), []);
  assert.deepEqual(normalizePackageIncludes(undefined), []);
  assert.deepEqual(normalizePackageIncludes([]), []);
  assert.deepEqual(
    normalizePackageIncludes('[{"name":" Camera Body ","quantity":"2"}]'),
    [{ name: "Camera Body", quantity: 2 }],
  );
  assert.deepEqual(normalizePackageIncludes('[{"name":"  ","quantity":2}]'), []);
  assert.deepEqual(normalizePackageIncludes("{invalid"), []);
});

test("coerces and bounds quantities to integers from 1 through 99", () => {
  assert.deepEqual(
    normalizePackageIncludes([
      { name: "Zero", quantity: 0 },
      { name: "Negative", quantity: -1 },
      { name: "String", quantity: "3" },
      { name: "Decimal", quantity: 2.7 },
      { name: "Huge", quantity: 1e100 },
      { name: "Missing" },
    ]),
    [
      { name: "Zero", quantity: 1 },
      { name: "Negative", quantity: 1 },
      { name: "String", quantity: 3 },
      { name: "Decimal", quantity: 2 },
      { name: "Huge", quantity: 99 },
      { name: "Missing", quantity: 1 },
    ],
  );
});

test("merges duplicate names case-insensitively, retaining first spelling", () => {
  assert.deepEqual(
    normalizePackageIncludes([
      { name: " Batteries ", quantity: 2 },
      { name: "batteries", quantity: 3 },
      { name: "BATTERIES", quantity: 100 },
    ]),
    [{ name: "Batteries", quantity: 99 }],
  );
});

test("trims and truncates names, and caps normalized output at 30 unique items", () => {
  const longName = `  ${"x".repeat(82)}  `;
  const normalized = normalizePackageIncludes([
    { name: longName, quantity: 1 },
    ...Array.from({ length: 31 }, (_, index) => ({
      name: `Item ${index}`,
      quantity: 1,
    })),
  ]);

  assert.equal(normalized[0].name.length, 80);
  assert.equal(normalized.length, 30);
  assert.equal(normalized[0].name.startsWith("x"), true);
});

test("validates API input and reports malformed quantities and item limits", () => {
  assert.deepEqual(validatePackageIncludes(null), { valid: true, errors: [] });
  assert.deepEqual(validatePackageIncludes([]), { valid: true, errors: [] });
  assert.deepEqual(validatePackageIncludes([{ name: "  " }]), {
    valid: true,
    errors: [],
  });

  const invalidQuantity = validatePackageIncludes([
    { name: "Battery", quantity: 0 },
  ]);
  assert.equal(invalidQuantity.valid, false);
  assert.match(invalidQuantity.errors[0], /quantity must be a whole number/);

  assert.equal(
    validatePackageIncludes("{invalid").valid,
    false,
  );
  assert.equal(
    validatePackageIncludes(
      Array.from({ length: 31 }, (_, index) => ({
        name: `Item ${index}`,
        quantity: 1,
      })),
    ).valid,
    false,
  );
});

test("preserves omitted update values and clears explicitly empty values", () => {
  const existing = [{ name: "Battery", quantity: 2 }];

  assert.equal(mergePackageIncludes(existing, { available: false }), existing);
  assert.deepEqual(mergePackageIncludes(existing, { packageIncludes: [] }), []);
});
