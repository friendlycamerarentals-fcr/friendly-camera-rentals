// src/lib/rewards/rewardHelpers.js

/**
 * Generate Reward ID
 * Example:
 * RWD-100001
 */

export function generateRewardId(lastRewardId) {
  if (!lastRewardId) {
    return "RWD-100001";
  }

  const lastNumber = Number(lastRewardId.split("-")[1]);

  const nextNumber = lastNumber + 1;

  return `RWD-${String(nextNumber).padStart(6, "0")}`;
}

/**
 * Reward Percentage
 */

export const REWARD_PERCENTAGE = 10;

/**
 * Calculate Discount Amount
 */

export function calculateRewardAmount(rentalAmount) {
  return Math.round((Number(rentalAmount) * REWARD_PERCENTAGE) / 100);
}

/**
 * Calculate Final Amount
 */

export function calculateFinalAmount(rentalAmount) {
  const discount = calculateRewardAmount(rentalAmount);

  return Number(rentalAmount) - discount;
}

/**
 * Expiry Date
 * Reward Validity = 3 Months
 */

export function calculateRewardExpiry(completedDate) {
  const date = new Date(completedDate);

  date.setMonth(date.getMonth() + 3);

  return date;
}

/**
 * Check Expired
 */

export function isRewardExpired(expireDate) {
  return new Date() > new Date(expireDate);
}

/**
 * Reward Status
 */

export const RewardStatus = {
  ACTIVE: "Active",
  APPLIED: "Applied",
  USED: "Used",
  EXPIRED: "Expired",
};

/**
 * Can Reward Apply?
 */

export function canApplyReward(reward) {
  if (!reward) return false;

  if (reward.status !== RewardStatus.ACTIVE) return false;

  if (isRewardExpired(reward.expireDate)) return false;

  return true;
}

/**
 * Get Remaining Reward
 */

export function getRemainingReward(status) {
  if (status === RewardStatus.USED || status === RewardStatus.EXPIRED) {
    return "0%";
  }

  return "10%";
}

/**
 * Format Currency
 */

export function formatCurrency(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

/**
 * Format Date
 */

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
