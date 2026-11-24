import test from "node:test";
import assert from "node:assert/strict";
import { dismissRentalDeleteConfirmation } from "./rentalDeleteConfirmation.js";

test("Cancel dismisses the rental confirmation without deleting", () => {
  let cancelCalls = 0;
  let deleteCalls = 0;

  dismissRentalDeleteConfirmation({
    deleting: false,
    onCancel: () => {
      cancelCalls += 1;
    },
  });

  assert.equal(cancelCalls, 1);
  assert.equal(deleteCalls, 0);
});

test("rental confirmation cannot be dismissed while deletion is in flight", () => {
  let cancelCalls = 0;

  const dismissed = dismissRentalDeleteConfirmation({
    deleting: true,
    onCancel: () => {
      cancelCalls += 1;
    },
  });

  assert.equal(dismissed, false);
  assert.equal(cancelCalls, 0);
});
