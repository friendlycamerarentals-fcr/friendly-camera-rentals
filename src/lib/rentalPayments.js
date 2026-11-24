import { fromPaise, sumPaise, toPaise } from "./rentalDuration.js";

export function getExtraChargeTotal(extraCharges = []) {
  return fromPaise(
    sumPaise(
      (Array.isArray(extraCharges) ? extraCharges : []).map((entry) =>
        Number(entry?.extraAmount || 0),
      ),
    ),
  );
}

export function getFinalRentalAmount(rental, extraCharges = []) {
  const originalAmount = Number(
    rental.originalAmount ??
      Number(rental.totalAmount || 0) + Number(rental.rewardDiscount || 0),
  );
  const extraChargeTotal = getExtraChargeTotal(extraCharges);
  const rewardDiscount = Number(rental.rewardDiscount || 0);
  const otherDiscount = Number(rental.discount || 0);

  return Math.max(
    fromPaise(
      toPaise(originalAmount) +
        toPaise(extraChargeTotal) -
        toPaise(rewardDiscount) -
        toPaise(otherDiscount),
    ),
    0,
  );
}

export function getAdjustedRewardDiscount({
  originalAmount,
  rewardDiscount,
  otherDiscount,
  advanceAmount,
}) {
  const rewardDiscountLimit = Math.max(
    fromPaise(
      toPaise(originalAmount) -
        toPaise(otherDiscount) -
        toPaise(advanceAmount),
    ),
    0,
  );
  return Math.min(Number(rewardDiscount || 0), rewardDiscountLimit);
}

export function summarizeRentalPayments(
  rental,
  paymentHistory = [],
  extraCharges = [],
) {
  const originalAmount = Number(
    rental.originalAmount ??
      Number(rental.totalAmount || 0) + Number(rental.rewardDiscount || 0),
  );
  const extraChargeTotal = getExtraChargeTotal(extraCharges);
  const rewardDiscount = Number(rental.rewardDiscount || 0);
  const otherDiscount = Number(rental.discount || 0);
  const finalRent = Math.max(
    fromPaise(
      toPaise(originalAmount) +
        toPaise(extraChargeTotal) -
        toPaise(rewardDiscount) -
        toPaise(otherDiscount),
    ),
    0,
  );
  const activePayments = paymentHistory.filter(
    (payment) =>
      payment.deletedAt === null || payment.deletedAt === undefined,
  );
  const verifiedPayments = activePayments.filter(
    (payment) => payment.verified === true,
  );
  const totalVerifiedPayments = fromPaise(
    sumPaise(verifiedPayments.map((payment) => payment.amount)),
  );
  const overpaidAmount = Math.max(
    fromPaise(toPaise(totalVerifiedPayments) - toPaise(finalRent)),
    0,
  );
  const advanceReceived = fromPaise(
    sumPaise(
      verifiedPayments
        .filter((payment) => payment.paymentType === "Advance")
        .map((payment) => payment.amount),
    ),
  );
  const latestAdvancePayment = verifiedPayments
    .filter((payment) => payment.paymentType === "Advance")
    .sort(
      (left, right) =>
        new Date(left.createdAt || left.verifiedAt || 0) -
        new Date(right.createdAt || right.verifiedAt || 0),
    )
    .at(-1);

  return {
    originalAmount,
    totalExtraCharges: extraChargeTotal,
    otherDiscount,
    rewardDiscount,
    finalRent,
    advanceReceived,
    advanceVerifiedAt: latestAdvancePayment?.verifiedAt || null,
    advanceVerifiedBy: latestAdvancePayment?.verifiedBy || null,
    advancePaymentMethod: latestAdvancePayment?.method || null,
    advancePaymentRef: latestAdvancePayment?.reference || null,
    totalVerifiedPayments,
    overpaidAmount,
    remainingAmount: Math.max(
      fromPaise(toPaise(finalRent) - toPaise(totalVerifiedPayments)),
      0,
    ),
  };
}

export function withRentalPaymentSummary(rental, paymentHistory = [], extraCharges = []) {
  const activePaymentHistory = paymentHistory.filter(
    (payment) =>
      payment.deletedAt === null || payment.deletedAt === undefined,
  );
  const paymentSummary = summarizeRentalPayments(
    rental,
    activePaymentHistory,
    extraCharges,
  );
  return {
    ...rental,
    extraCharges,
    paymentHistory: activePaymentHistory,
    paymentSummary,
    advanceAmount: paymentSummary.advanceReceived,
    advanceVerified: paymentSummary.advanceReceived > 0,
    advanceVerifiedAt: paymentSummary.advanceVerifiedAt,
    advanceVerifiedBy: paymentSummary.advanceVerifiedBy,
    advancePaymentMethod: paymentSummary.advancePaymentMethod,
    advancePaymentRef: paymentSummary.advancePaymentRef,
    totalVerifiedPayments: paymentSummary.totalVerifiedPayments,
    remainingAmount: paymentSummary.remainingAmount,
  };
}
