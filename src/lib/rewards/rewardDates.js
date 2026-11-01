import { REWARD_VALIDITY_MONTHS } from "../../constants/rewardStatus.js";

export function calculateExpiryDate(baseDate = new Date()) {
  if (
    typeof baseDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(baseDate)
  ) {
    const date = new Date(`${baseDate}T00:00:00.000Z`);
    date.setUTCMonth(date.getUTCMonth() + REWARD_VALIDITY_MONTHS);
    return date;
  }

  const date = new Date(baseDate);
  date.setMonth(date.getMonth() + REWARD_VALIDITY_MONTHS);
  return date;
}

export function getManualRewardLifecycle(expireDate, now = new Date()) {
  const isExpired = new Date(expireDate).getTime() < now.getTime();
  return {
    status: isExpired ? "Expired" : "Active",
    expiredDate: isExpired ? now : null,
  };
}
