export const RENTAL_PAYMENT_METHODS = ["Cash", "UPI"];
export const RENTAL_PAYMENT_TYPES = ["Advance", "Balance"];

export function validateExpectedAdvance(value) {
  if (value == null || value === "") return 0;

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    const error = new Error("Expected advance must be a non-negative amount.");
    error.status = 400;
    throw error;
  }
  return Math.round(amount * 100) / 100;
}

export function validateManualRentalAdvance({
  action,
  advanceExpected,
  payment,
  finalAmount,
}) {
  const expectedAmount = validateExpectedAdvance(advanceExpected);
  if (!Number.isFinite(finalAmount) || finalAmount < 0) {
    const error = new Error("Set a valid final rental amount.");
    error.status = 400;
    throw error;
  }
  if (expectedAmount > finalAmount) {
    const error = new Error("Advance cannot exceed the final rental amount.");
    error.status = 400;
    throw error;
  }

  if (action !== "confirm") {
    if (payment != null) {
      const error = new Error(
        "Pending rentals cannot record payments. Record an advance after confirming receipt.",
      );
      error.status = 400;
      throw error;
    }
    return { advanceExpected: expectedAmount, payment: null };
  }

  if (expectedAmount === 0) {
    if (payment != null) {
      const error = new Error(
        "Do not submit a payment when no advance amount was entered.",
      );
      error.status = 400;
      throw error;
    }
    return { advanceExpected: expectedAmount, payment: null };
  }

  if (payment == null) {
    const error = new Error(
      "Select a Cash or UPI method to record the advance received on confirmation.",
    );
    error.status = 400;
    throw error;
  }

  const validatedPayment = validateAdvancePayment(
    payment,
    finalAmount,
    finalAmount,
  );
  if (Math.round(validatedPayment.amount * 100) !== Math.round(expectedAmount * 100)) {
    const error = new Error(
      "The recorded advance must match the amount entered for confirmation.",
    );
    error.status = 400;
    throw error;
  }
  if (validatedPayment.paymentType !== "Advance") {
    const error = new Error("Manual rental confirmation only records an advance.");
    error.status = 400;
    throw error;
  }

  return { advanceExpected: expectedAmount, payment: validatedPayment };
}

export function matchesRentalPaymentSubmission(existingPayment, payment) {
  return (
    Math.round(Number(existingPayment.amount) * 100) ===
      Math.round(payment.amount * 100) &&
    existingPayment.paymentType === payment.paymentType &&
    existingPayment.method === payment.method &&
    (existingPayment.reference || null) === payment.reference
  );
}

export function validateAdvancePayment(
  payment,
  remainingBalance,
  rentalAmount = remainingBalance,
) {
  const submittedAmount = Number(payment?.amount);
  const amount = Math.round(submittedAmount * 100) / 100;
  const method =
    typeof payment?.method === "string" ? payment.method.trim() : "";
  const reference =
    typeof payment?.reference === "string" ? payment.reference.trim() : "";

  if (
    payment?.amount == null ||
    !Number.isFinite(submittedAmount) ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    const error = new Error("Advance payment amount must be a positive number.");
    error.status = 400;
    throw error;
  }
  if (!method) {
    const error = new Error("Payment method is required.");
    error.status = 400;
    throw error;
  }
  if (!RENTAL_PAYMENT_METHODS.includes(method)) {
    const error = new Error(
      `Unsupported payment method. Choose ${RENTAL_PAYMENT_METHODS.join(" or ")}.`,
    );
    error.status = 400;
    throw error;
  }
  const paymentType =
    typeof payment?.paymentType === "string" ? payment.paymentType.trim() : "";
  if (!RENTAL_PAYMENT_TYPES.includes(paymentType)) {
    const error = new Error(
      `Unsupported payment type. Choose ${RENTAL_PAYMENT_TYPES.join(" or ")}.`,
    );
    error.status = 400;
    throw error;
  }
  const idempotencyKey =
    typeof payment?.idempotencyKey === "string"
      ? payment.idempotencyKey.trim()
      : "";
  if (!idempotencyKey || idempotencyKey.length > 128) {
    const error = new Error("A valid payment submission key is required.");
    error.status = 400;
    throw error;
  }
  if (!Number.isFinite(rentalAmount) || rentalAmount <= 0) {
    const error = new Error("Set a valid rental amount before recording a payment.");
    error.status = 400;
    throw error;
  }
  const availableBalance = Math.round(remainingBalance * 100) / 100;
  if (!Number.isFinite(availableBalance)) {
    const error = new Error("Set a valid rental amount before recording a payment.");
    error.status = 400;
    throw error;
  }
  if (amount > availableBalance) {
    const error = new Error(
      `Advance cannot exceed the remaining balance (₹${availableBalance.toFixed(2)}).`,
    );
    error.status = 400;
    throw error;
  }

  return {
    amount,
    method,
    reference: reference || null,
    paymentType,
    idempotencyKey,
  };
}

export function validateOptionalAdvancePayment(payment, remainingBalance) {
  if (payment == null) return null;

  const rawAmount = payment.amount == null || payment.amount === ""
    ? 0
    : Number(payment.amount);
  if (!Number.isFinite(rawAmount) || rawAmount < 0) {
    const error = new Error(
      "Advance payment amount must be a valid non-negative amount.",
    );
    error.status = 400;
    throw error;
  }
  if (rawAmount === 0) return null;

  return validateAdvancePayment(payment, remainingBalance);
}
