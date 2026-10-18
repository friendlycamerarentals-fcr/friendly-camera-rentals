import { transaction } from "@/db/query";
import { REWARD_STATUS } from "@/constants/rewardStatus";
import { isRewardEligible } from "@/lib/rewards/rewardValidation";

export async function reserveRewardForRental(
  client,
  {
    customerId,
    rewardId,
    rentalRequestId,
    originalAmount,
    otherDiscount = 0,
    advanceAmount = 0,
  },
) {
  const customerRows = await client.query(
    'SELECT "id" FROM "Customer" WHERE "customerId" = $1 LIMIT 1 FOR UPDATE',
    [customerId],
  );
  if (!customerRows.rows.length) {
    return {
      success: false,
      message: "Customer record was not found for this reward.",
    };
  }

  const rewardRows = rewardId
    ? await client.query(
        'SELECT * FROM "Reward" WHERE "rewardId" = $1 AND "customerId" = $2 LIMIT 1 FOR UPDATE',
        [rewardId, customerId],
      )
    : await client.query(
        'SELECT * FROM "Reward" WHERE "customerId" = $1 AND "status" = $2 AND "expireDate" >= NOW() ORDER BY "createdAt" ASC LIMIT 1 FOR UPDATE',
        [customerId, REWARD_STATUS.ACTIVE],
      );
  const reward = rewardRows.rows[0];

  if (!reward) {
    return {
      success: false,
      message: "No matching reward is available for this customer.",
    };
  }

  if (reward.status !== REWARD_STATUS.ACTIVE) {
    return {
      success: false,
      message: "This reward is already reserved or has been consumed.",
    };
  }

  const outstandingRows = await client.query(
    `SELECT "id" FROM "Reward"
     WHERE "customerId" = $1
       AND ("status" = $2 OR ("status" = $3 AND "expireDate" >= NOW()))
     ORDER BY "createdAt" ASC
     FOR UPDATE`,
    [customerId, REWARD_STATUS.APPLIED, REWARD_STATUS.ACTIVE],
  );
  if (
    outstandingRows.rows.length !== 1 ||
    outstandingRows.rows[0].id !== reward.id
  ) {
    return {
      success: false,
      message:
        "Another reward is already active or reserved for this customer.",
    };
  }

  if (new Date(reward.expireDate).getTime() < Date.now()) {
    await client.query(
      'UPDATE "Reward" SET "status" = $1, "expiredDate" = NOW() WHERE "id" = $2 AND "status" = $3',
      [REWARD_STATUS.EXPIRED, reward.id, REWARD_STATUS.ACTIVE],
    );
    return { success: false, message: "This reward has expired." };
  }

  const rewardAmount = Number(reward.rewardAmount || 0);
  const discount = Math.min(
    rewardAmount,
    Math.max(originalAmount - otherDiscount - advanceAmount, 0),
  );
  if (
    !Number.isFinite(rewardAmount) ||
    rewardAmount <= 0 ||
    !Number.isFinite(discount) ||
    discount <= 0
  ) {
    return {
      success: false,
      message: "No payable amount remains for the reward to cover.",
    };
  }

  const reservedRows = await client.query(
    'UPDATE "Reward" SET "status" = $1, "appliedRentalId" = $2, "appliedDate" = NOW(), "usedDate" = NULL, "expiredDate" = NULL WHERE "id" = $3 AND "status" = $4 AND "expireDate" >= NOW() RETURNING *',
    [REWARD_STATUS.APPLIED, rentalRequestId, reward.id, REWARD_STATUS.ACTIVE],
  );

  if (!reservedRows.rows.length) {
    return {
      success: false,
      message: "This reward is no longer available.",
    };
  }

  return {
    success: true,
    reward: reservedRows.rows[0],
    rewardDiscount: discount,
    finalAmount: originalAmount - discount - otherDiscount,
  };
}

export async function completeAppliedRewardInTransaction(
  client,
  rentalRequestId,
) {
  const customerRows = await client.query(
    `SELECT customer."id" FROM "Customer" customer
     INNER JOIN "RentalRequest" rental ON rental."customerId" = customer."customerId"
     WHERE rental."requestId" = $1
     LIMIT 1 FOR UPDATE OF customer`,
    [rentalRequestId],
  );
  if (!customerRows.rows.length) return null;

  const rows = await client.query(
    `SELECT reward.* FROM "Reward" reward
     INNER JOIN "RentalRequest" rental
       ON rental."requestId" = reward."appliedRentalId"
      AND rental."rewardId" = reward."rewardId"
     WHERE rental."requestId" = $1
       AND rental."status" = 'Completed'
       AND (
         reward."status" = $2
         OR (reward."status" = $3 AND reward."usedDate" IS NOT DISTINCT FROM reward."appliedDate")
       )
     LIMIT 1 FOR UPDATE OF reward`,
    [rentalRequestId, REWARD_STATUS.APPLIED, REWARD_STATUS.USED],
  );
  const reward = rows.rows[0];
  if (!reward) return null;

  const usedRows = await client.query(
    `UPDATE "Reward"
     SET "status" = $1,
         "usedDate" = CASE
           WHEN "status" = $2 THEN NOW()
           ELSE GREATEST(NOW(), COALESCE("appliedDate", NOW()) + INTERVAL '1 microsecond')
         END
     WHERE "id" = $3
     RETURNING *`,
    [REWARD_STATUS.USED, REWARD_STATUS.APPLIED, reward.id],
  );
  return usedRows.rows[0] || null;
}

export async function releaseAppliedRewardInTransaction(
  client,
  rentalRequestId,
) {
  const customerRows = await client.query(
    `SELECT customer."id" FROM "Customer" customer
     INNER JOIN "RentalRequest" rental ON rental."customerId" = customer."customerId"
     WHERE rental."requestId" = $1
     LIMIT 1 FOR UPDATE OF customer`,
    [rentalRequestId],
  );
  if (!customerRows.rows.length) return null;

  const rows = await client.query(
    `SELECT reward.* FROM "Reward" reward
     INNER JOIN "RentalRequest" rental
       ON rental."requestId" = reward."appliedRentalId"
      AND rental."rewardId" = reward."rewardId"
     WHERE rental."requestId" = $1
       AND rental."status" IN ('Cancelled', 'Rejected')
       AND (
         reward."status" = $2
         OR (reward."status" = $3 AND reward."usedDate" IS NOT DISTINCT FROM reward."appliedDate")
       )
     LIMIT 1 FOR UPDATE OF reward`,
    [rentalRequestId, REWARD_STATUS.APPLIED, REWARD_STATUS.USED],
  );
  const reward = rows.rows[0];
  if (!reward) return null;

  const releasedRows = await client.query(
    `UPDATE "Reward"
     SET "status" = CASE WHEN "expireDate" >= NOW() THEN $1 ELSE $2 END,
         "appliedRentalId" = NULL,
         "usedDate" = NULL,
         "expiredDate" = CASE WHEN "expireDate" < NOW() THEN COALESCE("expiredDate", NOW()) ELSE NULL END
     WHERE "id" = $3
     RETURNING *`,
    [REWARD_STATUS.ACTIVE, REWARD_STATUS.EXPIRED, reward.id],
  );
  return releasedRows.rows[0] || null;
}

/**
 * Apply customer's active reward.
 *
 * Called before creating a new rental.
 */
export async function applyReward({
  customerId,
  rentalRequestId,
  rewardId = null,
  productId = null,
  productCategory = null,
  productCategories = [],
}) {
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

  return transaction(async (client) => {
    const rentalRows = await client.query(
      'SELECT * FROM "RentalRequest" WHERE "requestId" = $1 LIMIT 1 FOR UPDATE',
      [rentalRequestId],
    );
    const rental = rentalRows.rows[0];

    if (!rental || rental.customerId !== customerId) {
      return {
        success: false,
        rewardApplied: false,
        message: "Rental does not belong to this customer.",
      };
    }
    if (
      !["Pending", "Confirmed", "Approved", "Picked Up", "Returned"].includes(
        rental.status,
      )
    ) {
      return {
        success: false,
        rewardApplied: false,
        message: "Rewards can only be reserved for an active rental.",
      };
    }

    const productRows = await client.query(
      'SELECT "category" FROM "RentalProduct" WHERE "id" = $1 LIMIT 1',
      [rental.productId],
    );
    if (!isRewardEligible(productRows.rows[0]?.category)) {
      return {
        success: false,
        rewardApplied: false,
        message: "This reward is only valid for camera rentals.",
      };
    }

    const originalAmount = Number(
      rental.originalAmount ??
        Number(rental.totalAmount || 0) + Number(rental.rewardDiscount || 0),
    );
    if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
      return {
        success: false,
        rewardApplied: false,
        message: "Invalid rental amount.",
      };
    }

    if (rental.rewardId) {
      return {
        success: true,
        rewardApplied: false,
        rewardDiscount: Number(rental.rewardDiscount || 0),
        originalAmount,
        finalAmount: Number(rental.totalAmount || 0),
        message: "A reward has already been applied to this rental.",
      };
    }

    const otherDiscount = Number(rental.discount || 0);
    const advancePaid = Number(rental.advanceAmount || 0);
    const reservation = await reserveRewardForRental(client, {
      customerId,
      rewardId,
      rentalRequestId,
      originalAmount,
      otherDiscount,
      advanceAmount: advancePaid,
    });
    if (!reservation.success) {
      return {
        success: false,
        rewardApplied: false,
        discount: 0,
        rewardDiscount: 0,
        originalAmount,
        finalAmount: Number(rental.totalAmount || 0),
        message: reservation.message,
      };
    }

    await client.query(
      'UPDATE "RentalRequest" SET "originalAmount" = $1, "rewardId" = $2, "rewardDiscount" = $3, "totalAmount" = $4, "updatedAt" = NOW() WHERE "requestId" = $5',
      [
        originalAmount,
        reservation.reward.rewardId,
        reservation.rewardDiscount,
        reservation.finalAmount,
        rentalRequestId,
      ],
    );

    return {
      success: true,
      rewardApplied: true,
      rewardId: reservation.reward.rewardId,
      reward: reservation.reward,
      discount: reservation.rewardDiscount,
      rewardDiscount: reservation.rewardDiscount,
      originalAmount,
      finalAmount: reservation.finalAmount,
      message: "Reward reserved for this rental.",
    };
  });
}

/**
 * Mark reward as Used
 * after rental becomes Completed.
 */
export async function completeAppliedReward(rentalRequestId) {
  return transaction(async (client) => {
    return completeAppliedRewardInTransaction(client, rentalRequestId);
  });
}
