import { query } from "@/db/query";
import { REWARD_STATUS } from "@/constants/rewardStatus";

async function getRentalRequestRewardColumnSupport() {
  try {
    const rows = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'RentalRequest'
        AND column_name IN ('rewardId', 'rewardDiscount')
    `);
    const columns = new Set(rows.map((row) => row.column_name));

    return {
      rewardId: columns.has("rewardId"),
      rewardDiscount: columns.has("rewardDiscount"),
    };
  } catch (error) {
    console.warn("[REWARD_SCHEMA_CHECK]", error.message);
    return {
      rewardId: false,
      rewardDiscount: false,
    };
  }
}

/**
 * Apply customer's active reward.
 *
 * Called before creating a new rental.
 */
export async function applyReward({
  customerId,
  rentalRequestId,
  totalAmount,
  productId = null,
  productCategory = null,
  productCategories = [],
}) {
  const rentalRows = await query(
    'SELECT * FROM "RentalRequest" WHERE "requestId" = $1 LIMIT 1',
    [rentalRequestId],
  );
  const rental = rentalRows[0];

  if (!rental || rental.customerId !== customerId) {
    return {
      success: false,
      rewardApplied: false,
      message: "Rental does not belong to this customer.",
    };
  }
  if (rental.status !== "Confirmed") {
    return {
      success: false,
      rewardApplied: false,
      message: "Rewards can only be applied to confirmed rentals.",
    };
  }

  totalAmount = Number(rental.totalAmount || 0);

  await query(
    'UPDATE "Reward" SET "status" = $1, "expiredDate" = NOW() WHERE "customerId" = $2 AND "status" = $3 AND "expireDate" < NOW()',
    [REWARD_STATUS.EXPIRED, customerId, REWARD_STATUS.ACTIVE],
  );

  if (!customerId) {
    return {
      success: false,
      message: "Customer ID is required.",
    };
  }

  if (!rentalRequestId) {
    return {
      success: false,
      message: "Rental Request ID is required.",
    };
  }

  if (!totalAmount || totalAmount <= 0) {
    return {
      success: false,
      message: "Invalid rental amount.",
    };
  }

  const rewardRows = await query(
    'SELECT * FROM "Reward" WHERE "customerId" = $1 AND "status" = $2 AND "expireDate" >= NOW() LIMIT 1',
    [customerId, REWARD_STATUS.ACTIVE],
  );
  const validation = rewardRows[0]
    ? { valid: true, reward: rewardRows[0] }
    : { valid: false, message: "No active reward available." };

  if (!validation.valid) {
    return {
      success: false,
      rewardApplied: false,
      discount: 0,
      finalAmount: totalAmount,
      reward: null,
      message: validation.message,
    };
  }

  const reward = validation.reward;
  const discount = reward.rewardAmount || 0;
  const finalAmount = Math.max(totalAmount - discount, 0);

  await query(
    'UPDATE "Reward" SET "status" = $1, "appliedRentalId" = $2, "appliedDate" = NOW(), "usedDate" = NOW() WHERE "id" = $3 AND "status" = $4',
    [REWARD_STATUS.USED, rentalRequestId, reward.id, REWARD_STATUS.ACTIVE],
  );

  const existingRentalRows = await query(
    'SELECT "requestId" FROM "RentalRequest" WHERE "requestId" = $1 LIMIT 1',
    [rentalRequestId],
  );

  const rewardColumns = await getRentalRequestRewardColumnSupport();

  if (
    existingRentalRows.length &&
    rewardColumns.rewardId &&
    rewardColumns.rewardDiscount
  ) {
    await query(
      'UPDATE "RentalRequest" SET "rewardId" = $1, "rewardDiscount" = $2, "totalAmount" = $3 WHERE "requestId" = $4',
      [reward.rewardId, discount, finalAmount, rentalRequestId],
    );
  }

  return {
    success: true,
    rewardApplied: true,
    rewardId: reward.rewardId,
    reward,
    discount,
    rewardDiscount: discount,
    originalAmount: totalAmount,
    finalAmount,
    message: "Reward applied successfully.",
  };
}

/**
 * Mark reward as Used
 * after rental becomes Completed.
 */
export async function completeAppliedReward(rentalRequestId) {
  const rows = await query(
    'SELECT * FROM "Reward" WHERE "appliedRentalId" = $1 AND "status" = $2 LIMIT 1',
    [rentalRequestId, REWARD_STATUS.APPLIED],
  );

  const reward = rows[0];
  if (!reward) {
    return;
  }

  await query(
    'UPDATE "Reward" SET "status" = $1, "usedDate" = NOW() WHERE "id" = $2',
    [REWARD_STATUS.USED, reward.id],
  );
}
