import { query } from "@/db/query";
import { REWARD_STATUS } from "@/constants/rewardStatus";

/**
 * Reward points are only eligible for Camera rentals.
 */
export function normalizeProductCategory(category) {
  return typeof category === "string" ? category.trim().toLowerCase() : "";
}

export function isRewardEligible(productCategory) {
  return normalizeProductCategory(productCategory) === "camera";
}

export function bookingContainsCamera(productCategories = []) {
  if (!Array.isArray(productCategories)) {
    return false;
  }

  return productCategories.some((category) => isRewardEligible(category));
}

/**
 * Get customer's active reward.
 */
export async function getActiveReward(customerId) {
  if (!customerId) return null;

  const rows = await query(
    'SELECT * FROM "Reward" WHERE "customerId" = $1 AND "status" = $2 AND "expireDate" >= NOW() ORDER BY "createdAt" DESC LIMIT 1',
    [customerId, REWARD_STATUS.ACTIVE],
  );

  return rows[0] || null;
}

/**
 * Check if customer has any usable reward.
 */
export async function hasActiveReward(customerId) {
  const reward = await getActiveReward(customerId);
  return !!reward;
}

/**
 * Validate reward before applying.
 */
export async function validateReward(
  customerId,
  productCategory = null,
  productCategories = [],
) {
  const categories = Array.isArray(productCategories)
    ? productCategories
    : [productCategory].filter(Boolean);

  if (!bookingContainsCamera(categories)) {
    return {
      valid: false,
      reward: null,
      message: "Reward points are only valid for Camera rentals.",
    };
  }

  const reward = await getActiveReward(customerId);

  if (!reward) {
    return {
      valid: false,
      reward: null,
      message: "No active reward available.",
    };
  }

  if (reward.status !== REWARD_STATUS.ACTIVE) {
    return {
      valid: false,
      reward: null,
      message: "Reward is not active.",
    };
  }

  if (new Date(reward.expireDate) < new Date()) {
    return {
      valid: false,
      reward: null,
      message: "Reward has expired.",
    };
  }

  return {
    valid: true,
    reward,
    message: "Reward is valid.",
  };
}

/**
 * Check whether reward already exists
 * for this rental.
 */
export async function rewardExistsForRental(rentalRequestId) {
  if (!rentalRequestId) return false;

  const rows = await query(
    'SELECT * FROM "Reward" WHERE "rentalRequestId" = $1 LIMIT 1',
    [rentalRequestId],
  );

  return rows.length > 0;
}

/**
 * Expire all expired rewards.
 */
export async function expireOldRewards() {
  const rows = await query(
    'UPDATE "Reward" SET "status" = $1, "expiredDate" = NOW() WHERE "status" = $2 AND "expireDate" < NOW() RETURNING *',
    [REWARD_STATUS.EXPIRED, REWARD_STATUS.ACTIVE],
  );

  return rows.length;
}

/**
 * Check whether customer already
 * has another active reward.
 */
export async function hasAnotherActiveReward(customerId) {
  const rows = await query(
    'SELECT * FROM "Reward" WHERE "customerId" = $1 AND "status" = $2 LIMIT 1',
    [customerId, REWARD_STATUS.ACTIVE],
  );

  return rows.length > 0;
}

/**
 * Calculate reward amount.
 */
export function calculateReward(totalAmount) {
  return Number((totalAmount * 0.1).toFixed(2));
}

/**
 * Calculate reward expiry date.
 */
export function calculateExpiryDate(baseDate = new Date()) {
  const date = new Date(baseDate);
  date.setMonth(date.getMonth() + 3);
  return date;
}
