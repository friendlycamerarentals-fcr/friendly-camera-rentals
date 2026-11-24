import test from "node:test";
import assert from "node:assert/strict";
import { createRentalPaymentDeleteHandler } from "./rentalPaymentDelete.js";

test("payment deletion rejects unauthenticated requests before opening a transaction", async () => {
  let transactionCalled = false;
  const requireAdmin = async () => {
    const error = new Error("Admin authentication required.");
    error.status = 401;
    throw error;
  };
  const handleDelete = createRentalPaymentDeleteHandler({
    requireAdmin,
    transaction: async () => {
      transactionCalled = true;
    },
  });

  const result = await handleDelete(null, {
    params: Promise.resolve({ id: "rental-id", paymentId: "payment-id" }),
  });

  assert.equal(result.status, 401);
  assert.equal(result.body.success, false);
  assert.equal(transactionCalled, false);
});

test("payment deletion returns 404 when the payment belongs to another rental", async () => {
  const queries = [];
  const handleDelete = createRentalPaymentDeleteHandler({
    requireAdmin: async () => ({ email: "admin@example.com" }),
    transaction: (callback) =>
      callback({
        query: async (sql, params) => {
          queries.push({ sql, params });
          if (sql.includes('FROM "RentalRequest"')) {
            return {
              rows: [{ id: "rental-id", requestId: "FCR-R100001" }],
            };
          }
          if (sql.includes('FROM "RentalPayment"')) {
            return { rows: [] };
          }
          throw new Error("Unexpected query.");
        },
      }),
  });

  const result = await handleDelete(null, {
    params: Promise.resolve({
      id: "rental-id",
      paymentId: "payment-from-another-rental",
    }),
  });

  assert.equal(result.status, 404);
  assert.equal(result.body.success, false);
  assert.equal(
    result.body.message,
    "Payment record not found for this rental.",
  );
  assert.deepEqual(queries[1].params, [
    "payment-from-another-rental",
    "FCR-R100001",
  ]);
});
