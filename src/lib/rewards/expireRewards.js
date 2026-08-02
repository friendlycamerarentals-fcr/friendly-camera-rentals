import { query } from "@/db/query";
import { REWARD_STATUS } from "@/constants/rewardStatus";

/**
 * Expire all rewards whose expiry date has passed.
 */
export async function expireRewards() {
  const rows = await query(
    'UPDATE "Reward" SET "status" = $1, "expiredDate" = NOW() WHERE "status" = $2 AND "expireDate" < NOW() RETURNING *',
    [REWARD_STATUS.EXPIRED, REWARD_STATUS.ACTIVE],
  );

  return {
    success: true,
    expiredCount: rows.length,
    message: `${rows.length} reward(s) expired.`,
  };
}

/**
 * Expire rewards for a specific customer.
 */
export async function expireCustomerRewards(customerId) {
  if (!customerId) {
    throw new Error("Customer ID is required.");
  }

  const rows = await query(
    'UPDATE "Reward" SET "status" = $1, "expiredDate" = NOW() WHERE "customerId" = $2 AND "status" = $3 AND "expireDate" < NOW() RETURNING *',
    [REWARD_STATUS.EXPIRED, customerId, REWARD_STATUS.ACTIVE],
  );

  return {
    success: true,
    expiredCount: rows.length,
  };
}

/**
 * Expire a reward by Reward ID.
 */
export async function expireRewardById(rewardId) {
  if (!rewardId) {
    throw new Error("Reward ID is required.");
  }

  const rows = await query(
    'SELECT * FROM "Reward" WHERE "rewardId" = $1 LIMIT 1',
    [rewardId],
  );
  const reward = rows[0];

  if (!reward) {
    return {
      success: false,
      message: "Reward not found.",
    };
  }

  if (reward.status === REWARD_STATUS.EXPIRED) {
    return {
      success: true,
      message: "Reward already expired.",
      reward,
    };
  }

  const updatedRows = await query(
    'UPDATE "Reward" SET "status" = $1, "expiredDate" = NOW() WHERE "rewardId" = $2 RETURNING *',
    [REWARD_STATUS.EXPIRED, rewardId],
  );

  return {
    success: true,
    reward: updatedRows[0],
    message: "Reward expired successfully.",
  };
}

/**
 * Check and expire rewards before any reward operation.
 * This should be called before:
 * - Checking rewards
 * - Applying rewards
 * - Loading Reward Admin page
 */
export async function checkExpiredRewards() {
  await expireRewards();
}

/**
 * Returns reward statistics.
 */
export async function getRewardExpiryStats() {
  const now = new Date();

  const [activeRows, expiredRows, usedRows, appliedRows, expiringSoonRows] =
    await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM "Reward" WHERE "status" = $1', [
        REWARD_STATUS.ACTIVE,
      ]),
      query('SELECT COUNT(*)::int AS count FROM "Reward" WHERE "status" = $1', [
        REWARD_STATUS.EXPIRED,
      ]),
      query('SELECT COUNT(*)::int AS count FROM "Reward" WHERE "status" = $1', [
        REWARD_STATUS.USED,
      ]),
      query('SELECT COUNT(*)::int AS count FROM "Reward" WHERE "status" = $1', [
        REWARD_STATUS.APPLIED,
      ]),
      query(
        'SELECT COUNT(*)::int AS count FROM "Reward" WHERE "status" = $1 AND "expireDate" >= $2 AND "expireDate" <= $3',
        [
          REWARD_STATUS.ACTIVE,
          now,
          new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        ],
      ),
    ]);

  return {
    active: Number(activeRows[0]?.count || 0),
    applied: Number(appliedRows[0]?.count || 0),
    used: Number(usedRows[0]?.count || 0),
    expired: Number(expiredRows[0]?.count || 0),
    expiringSoon: Number(expiringSoonRows[0]?.count || 0),
  };
}
