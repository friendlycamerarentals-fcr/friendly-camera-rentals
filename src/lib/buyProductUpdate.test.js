import test from "node:test";
import assert from "node:assert/strict";
import { runTransactionWithClient } from "../db/query.js";
import { updateBuyProductWithSoldEvent } from "./buyProductUpdate.js";

function createFakeClient(initialProduct, { failSoldEvent = false } = {}) {
  let product = { ...initialProduct };
  let pendingProduct = null;
  let pendingEvents = [];
  const statements = [];
  const events = [];

  return {
    events,
    statements,
    get product() {
      return product;
    },
    async query(sql, params = []) {
      statements.push(sql);

      if (sql === "BEGIN") {
        pendingProduct = { ...product };
        pendingEvents = [...events];
        return { rows: [] };
      }

      if (sql === "COMMIT") return { rows: [] };

      if (sql === "ROLLBACK") {
        product = pendingProduct;
        events.splice(0, events.length, ...pendingEvents);
        return { rows: [] };
      }

      if (sql.startsWith('SELECT * FROM "BuyProduct"')) {
        return { rows: [{ ...product }] };
      }

      if (sql.startsWith('UPDATE "BuyProduct"')) {
        const statusMatch = sql.match(/"status" = \$(\d+)/);
        const nameMatch = sql.match(/"name" = \$(\d+)/);
        product = {
          ...product,
          ...(nameMatch ? { name: params[Number(nameMatch[1]) - 1] } : {}),
          ...(statusMatch
            ? { status: params[Number(statusMatch[1]) - 1] }
            : {}),
        };
        return { rows: [{ ...product }] };
      }

      if (sql.startsWith('INSERT INTO "BuyProductSoldEvent"')) {
        if (failSoldEvent) throw new Error("Sold event insert failed");
        events.push({
          productId: params[0],
          productName: params[1],
          previousStatus: params[2],
          newStatus: params[3],
        });
        return { rows: [] };
      }

      throw new Error(`Unexpected query: ${sql}`);
    },
  };
}

test("records genuine sold transitions but not edits to an already-sold product", async () => {
  const client = createFakeClient({
    id: "product-1",
    name: "Camera",
    status: "In Stock",
  });

  await runTransactionWithClient(client, (transactionClient) =>
    updateBuyProductWithSoldEvent(transactionClient, "product-1", {
      status: "Sold",
    }),
  );
  await runTransactionWithClient(client, (transactionClient) =>
    updateBuyProductWithSoldEvent(transactionClient, "product-1", {
      name: "Updated Camera",
    }),
  );

  assert.equal(client.events.length, 1);
  assert.deepEqual(client.events[0], {
    productId: "product-1",
    productName: "Camera",
    previousStatus: "In Stock",
    newStatus: "Sold",
  });
});

test("records another sold event after the product returns to a non-sold status", async () => {
  const client = createFakeClient({
    id: "product-1",
    name: "Camera",
    status: "Sold",
  });

  await runTransactionWithClient(client, (transactionClient) =>
    updateBuyProductWithSoldEvent(transactionClient, "product-1", {
      status: "In Stock",
    }),
  );
  await runTransactionWithClient(client, (transactionClient) =>
    updateBuyProductWithSoldEvent(transactionClient, "product-1", {
      status: "Sold",
    }),
  );

  assert.equal(client.events.length, 1);
  assert.equal(client.events[0].previousStatus, "In Stock");
});

test("rolls back the product status if recording the sold event fails", async () => {
  const client = createFakeClient(
    { id: "product-1", name: "Camera", status: "In Stock" },
    { failSoldEvent: true },
  );

  await assert.rejects(
    runTransactionWithClient(client, (transactionClient) =>
      updateBuyProductWithSoldEvent(transactionClient, "product-1", {
        status: "Sold",
      }),
    ),
    /Sold event insert failed/,
  );

  assert.equal(client.product.status, "In Stock");
  assert.equal(client.events.length, 0);
  assert.equal(client.statements.at(-1), "ROLLBACK");
});
