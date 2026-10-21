import test from "node:test";
import assert from "node:assert/strict";
import {
  RENTAL_PAYMENT_METHODS,
  matchesRentalPaymentSubmission,
  validateAdvancePayment,
  validateExpectedAdvance,
  validateManualRentalAdvance,
  validateOptionalAdvancePayment,
} from "./rentalPayment.js";
import { summarizeRentalPayments } from "./rentalPayments.js";

test("allows verified cash and UPI advances with optional references", () => {
  assert.deepEqual(RENTAL_PAYMENT_METHODS, ["Cash", "UPI"]);
  assert.deepEqual(
    validateAdvancePayment(
      {
        amount: 100,
        paymentType: "Advance",
        method: "Cash",
        reference: "",
        idempotencyKey: "cash-key",
      },
      500,
    ),
    {
      amount: 100,
      method: "Cash",
      reference: null,
      paymentType: "Advance",
      idempotencyKey: "cash-key",
    },
  );
  assert.deepEqual(
    validateAdvancePayment(
      {
        amount: 125.5,
        paymentType: "Balance",
        method: "UPI",
        reference: "txn-123",
        idempotencyKey: "upi-key",
      },
      500,
    ),
    {
      amount: 125.5,
      method: "UPI",
      reference: "txn-123",
      paymentType: "Balance",
      idempotencyKey: "upi-key",
    },
  );
});

test("accepts advances and balance payments without a transaction reference", () => {
  for (const paymentType of ["Advance", "Balance"]) {
    assert.deepEqual(
      validateAdvancePayment(
        {
          amount: 100,
          paymentType,
          method: "UPI",
          idempotencyKey: `${paymentType.toLowerCase()}-no-reference`,
        },
        500,
      ),
      {
        amount: 100,
        method: "UPI",
        reference: null,
        paymentType,
        idempotencyKey: `${paymentType.toLowerCase()}-no-reference`,
      },
    );
  }
});

test("rejects payment methods outside Cash and UPI", () => {
  for (const method of ["Bank Transfer", "Card", "Other", "cash", ""]) {
    assert.throws(
      () =>
        validateAdvancePayment(
          {
            amount: 50,
            paymentType: "Advance",
            method,
            idempotencyKey: `key-${method}`,
          },
          500,
        ),
      /Payment method is required|Unsupported payment method/,
    );
    assert.throws(
      () =>
        validateOptionalAdvancePayment(
          {
            amount: 50,
            paymentType: "Advance",
            method,
            idempotencyKey: `optional-key-${method}`,
          },
          500,
        ),
      /Payment method is required|Unsupported payment method/,
    );
  }
});

test("does not require or invent payment details for zero advances", () => {
  assert.equal(validateOptionalAdvancePayment(undefined, 500), null);
  assert.equal(
    validateOptionalAdvancePayment({ amount: "", method: "" }, 500),
    null,
  );
  assert.equal(
    validateOptionalAdvancePayment({ amount: 0, method: "Other" }, 500),
    null,
  );
});

test("validates optional expected advance without creating a payment", () => {
  assert.equal(validateExpectedAdvance(undefined), 0);
  assert.equal(validateExpectedAdvance(null), 0);
  assert.equal(validateExpectedAdvance(""), 0);
  assert.equal(validateExpectedAdvance(0), 0);
  assert.equal(validateExpectedAdvance("500.129"), 500.13);
  assert.throws(() => validateExpectedAdvance(-1), /non-negative amount/);
  assert.throws(() => validateExpectedAdvance("invalid"), /non-negative amount/);
});

test("keeps expected advances unpaid for pending manual rentals", () => {
  assert.deepEqual(
    validateManualRentalAdvance({
      action: "pending",
      advanceExpected: 500,
      payment: undefined,
      finalAmount: 1500,
    }),
    { advanceExpected: 500, payment: null },
  );
  assert.throws(
    () =>
      validateManualRentalAdvance({
        action: "pending",
        advanceExpected: 500,
        payment: { amount: 500 },
        finalAmount: 1500,
      }),
    /Pending rentals cannot record payments/,
  );
});

test("records a confirmed manual advance and permits confirmation with none", () => {
  const payment = {
    amount: 500,
    paymentType: "Advance",
    method: "Cash",
    idempotencyKey: "manual-advance-key",
  };
  const withAdvance = validateManualRentalAdvance({
    action: "confirm",
    advanceExpected: 500,
    payment,
    finalAmount: 1500,
  });
  assert.equal(withAdvance.advanceExpected, 500);
  assert.equal(withAdvance.payment.amount, 500);
  assert.equal(withAdvance.payment.method, "Cash");

  assert.deepEqual(
    validateManualRentalAdvance({
      action: "confirm",
      advanceExpected: "",
      payment: undefined,
      finalAmount: 1500,
    }),
    { advanceExpected: 0, payment: null },
  );
  assert.throws(
    () =>
      validateManualRentalAdvance({
        action: "confirm",
        advanceExpected: 0,
        payment: {
          amount: 0,
          paymentType: "Advance",
          method: "Cash",
          idempotencyKey: "zero-amount-key",
        },
        finalAmount: 1500,
      }),
    /Do not submit a payment/,
  );
});

test("rejects manual confirmation with mismatched, invalid, or excessive advances", () => {
  assert.throws(
    () =>
      validateManualRentalAdvance({
        action: "confirm",
        advanceExpected: 600,
        payment: {
          amount: 500,
          paymentType: "Advance",
          method: "Cash",
          idempotencyKey: "mismatch-key",
        },
        finalAmount: 1500,
      }),
    /must match/,
  );
  assert.throws(
    () =>
      validateManualRentalAdvance({
        action: "confirm",
        advanceExpected: 1600,
        payment: {
          amount: 1600,
          paymentType: "Advance",
          method: "UPI",
          idempotencyKey: "too-large-key",
        },
        finalAmount: 1500,
      }),
    /cannot exceed/,
  );
  assert.throws(
    () =>
      validateManualRentalAdvance({
        action: "confirm",
        advanceExpected: 500,
        payment: {
          amount: 500,
          paymentType: "Advance",
          method: "Other",
          idempotencyKey: "invalid-method-key",
        },
        finalAmount: 1500,
      }),
    /Unsupported payment method/,
  );
});

test("calculates advance and outstanding from verified transactions exactly once", () => {
  const rental = {
    originalAmount: 1800,
    discount: 100,
    rewardDiscount: 200,
  };
  const noAdvanceSummary = summarizeRentalPayments(rental, []);
  assert.equal(noAdvanceSummary.finalRent, 1500);
  assert.equal(noAdvanceSummary.advanceReceived, 0);
  assert.equal(noAdvanceSummary.totalVerifiedPayments, 0);
  assert.equal(noAdvanceSummary.remainingAmount, 1500);

  const advanceSummary = summarizeRentalPayments(rental, [
    { paymentType: "Advance", amount: 500, verified: true },
  ]);
  assert.equal(advanceSummary.finalRent, 1500);
  assert.equal(advanceSummary.advanceReceived, 500);
  assert.equal(advanceSummary.totalVerifiedPayments, 500);
  assert.equal(advanceSummary.remainingAmount, 1000);

  const paidSummary = summarizeRentalPayments(rental, [
    { paymentType: "Advance", amount: 500, verified: true },
    { paymentType: "Balance", amount: 1000, verified: true },
    { paymentType: "Balance", amount: 50, verified: false },
  ]);
  assert.equal(paidSummary.advanceReceived, 500);
  assert.equal(paidSummary.totalVerifiedPayments, 1500);
  assert.equal(paidSummary.remainingAmount, 0);
});

test("recognizes retry of the same payment but rejects changed duplicate payload", () => {
  const saved = {
    amount: 500,
    paymentType: "Advance",
    method: "Cash",
    reference: null,
  };
  assert.equal(
    matchesRentalPaymentSubmission(saved, {
      amount: 500,
      paymentType: "Advance",
      method: "Cash",
      reference: null,
    }),
    true,
  );
  assert.equal(
    matchesRentalPaymentSubmission(saved, {
      amount: 600,
      paymentType: "Advance",
      method: "Cash",
      reference: null,
    }),
    false,
  );
});
