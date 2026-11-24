import test from "node:test";
import assert from "node:assert/strict";
import { createRentalRequestDeleteHandler } from "./rentalRequestDelete.js";

const params = { params: Promise.resolve({ id: "rental-id" }) };

test("rental deletion rejects unauthenticated requests before a transaction", async () => {
  let transactionCalled = false;
  const handleDelete = createRentalRequestDeleteHandler({
    requireAdmin: async () => {
      const error = new Error("Admin authentication required.");
      error.status = 401;
      throw error;
    },
    transaction: async () => {
      transactionCalled = true;
    },
    releaseAppliedReward: async () => {},
  });

  const result = await handleDelete(null, params);

  assert.equal(result.status, 401);
  assert.equal(result.body.success, false);
  assert.equal(transactionCalled, false);
});

test("rental deletion returns 404 for a missing booking", async () => {
  const statements = [];
  const handleDelete = createRentalRequestDeleteHandler({
    requireAdmin: async () => ({ email: "admin@example.com" }),
    transaction: (callback) =>
      callback({
        query: async (sql) => {
          statements.push(sql);
          return { rows: [] };
        },
      }),
    releaseAppliedReward: async () => {},
  });

  const result = await handleDelete(null, params);

  assert.equal(result.status, 404);
  assert.equal(result.body.message, "Rental booking was not found.");
  assert.equal(statements.length, 1);
});

test("rental deletion reports an already-deleted booking as 404", async () => {
  const statements = [];
  const handleDelete = createRentalRequestDeleteHandler({
    requireAdmin: async () => ({ email: "admin@example.com" }),
    transaction: (callback) =>
      callback({
        query: async (sql) => {
          statements.push(sql);
          return {
            rows: [
              {
                id: "rental-id",
                requestId: "FCR-R100001",
                deletedAt: new Date("2026-11-25T10:00:00Z"),
              },
            ],
          };
        },
      }),
    releaseAppliedReward: async () => {},
  });

  const result = await handleDelete(null, params);

  assert.equal(result.status, 404);
  assert.equal(result.body.alreadyDeleted, true);
  assert.match(result.body.message, /already deleted/i);
  assert.equal(statements.length, 1);
});

test("rental deletion audits the booking and releases any applied reward atomically", async () => {
  let transactionCount = 0;
  let releasedRentalId = null;
  const statements = [];
  const handleDelete = createRentalRequestDeleteHandler({
    requireAdmin: async () => ({ email: "admin@example.com" }),
    transaction: async (callback) => {
      transactionCount += 1;
      return callback({
        query: async (sql, values) => {
          statements.push({ sql, values });
          if (sql.includes('SELECT "id", "requestId"')) {
            return {
              rows: [
                {
                  id: "rental-id",
                  requestId: "FCR-R100001",
                  rewardId: "RWD-100001",
                  rewardDiscount: 10,
                  deletedAt: null,
                },
              ],
            };
          }
          if (sql.includes('UPDATE "RentalRequest"')) {
            return {
              rows: [
                {
                  id: "rental-id",
                  requestId: "FCR-R100001",
                  deletedAt: new Date("2026-11-25T10:00:00Z"),
                  deletedBy: "admin@example.com",
                },
              ],
            };
          }
          throw new Error("Unexpected query.");
        },
      });
    },
    releaseAppliedReward: async (_client, requestId) => {
      releasedRentalId = requestId;
    },
  });

  const result = await handleDelete(null, params);

  assert.equal(result.status, 200);
  assert.equal(transactionCount, 1);
  assert.equal(result.body.data.deletedBy, "admin@example.com");
  assert.equal(releasedRentalId, "FCR-R100001");
  assert.equal(
    statements.some(({ sql }) => /DELETE\s+FROM/i.test(sql)),
    false,
  );
  assert.deepEqual(statements[1].values, ["admin@example.com", "rental-id"]);
});
