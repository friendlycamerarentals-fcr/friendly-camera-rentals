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
  const verifiedPayments = paymentHistory.filter(
    (payment) => payment.verified === true,
  );
  const totalVerifiedPayments = fromPaise(
    sumPaise(verifiedPayments.map((payment) => payment.amount)),
  );
  const advanceReceived = fromPaise(
    sumPaise(
      verifiedPayments
        .filter((payment) => payment.paymentType === "Advance")
        .map((payment) => payment.amount),
    ),
  );

  return {
    originalAmount,
    totalExtraCharges: extraChargeTotal,
    otherDiscount,
    rewardDiscount,
    finalRent,
    advanceReceived,
    totalVerifiedPayments,
    remainingAmount: Math.max(
      fromPaise(toPaise(finalRent) - toPaise(totalVerifiedPayments)),
      0,
    ),
  };
}

export function withRentalPaymentSummary(rental, paymentHistory = [], extraCharges = []) {
  const paymentSummary = summarizeRentalPayments(
    rental,
    paymentHistory,
    extraCharges,
  );
  return {
    ...rental,
    extraCharges,
    paymentHistory,
    paymentSummary,
    advanceAmount: paymentSummary.advanceReceived,
    advanceVerified: paymentSummary.advanceReceived > 0,
    totalVerifiedPayments: paymentSummary.totalVerifiedPayments,
    remainingAmount: paymentSummary.remainingAmount,
  };
}
