import test from "node:test";
import assert from "node:assert/strict";
import { runTransactionWithClient } from "./query.js";

test("rolls back a transaction when a query fails", async () => {
  const statements = [];
  const client = {
    async query(sql) {
      statements.push(sql);
      if (sql === "INSERT sold event") {
        throw new Error("Sold event insert failed");
      }
    },
  };

  await assert.rejects(
    runTransactionWithClient(client, async (transactionClient) => {
      await transactionClient.query("INSERT sold event");
    }),
    /Sold event insert failed/,
  );
  assert.deepEqual(statements, ["BEGIN", "INSERT sold event", "ROLLBACK"]);
});
