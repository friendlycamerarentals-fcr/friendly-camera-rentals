import { createId } from "@/lib/createId";
import { transaction } from "@/db/query";
import {
  REWARD_PERCENTAGE,
  REWARD_STATUS,
  REWARD_ID_PREFIX,
  REWARD_START_NUMBER,
} from "@/constants/rewardStatus";

import { calculateReward, calculateExpiryDate } from "./rewardValidation";
import {
  getNextRewardId,
  validateManualRewardInput,
} from "./manualReward";
import { getManualRewardLifecycle } from "./rewardDates";

/**
 * Generate next Reward ID
 * Example: FCR-R100001
 */
export async function generateRewardId(client) {
  await client.query("SELECT pg_advisory_xact_lock(100001)");
  const result = await client.query(
    `SELECT "rewardId" FROM "Reward"
     WHERE "rewardId" ~ '^${REWARD_ID_PREFIX}[0-9]+$'
     ORDER BY substring("rewardId" from '([0-9]+)$')::BIGINT DESC
     LIMIT 1`,
  );
  return getNextRewardId(
    result.rows[0]?.rewardId,
    REWARD_ID_PREFIX,
    REWARD_START_NUMBER,
  );
}

export async function createManualReward({
  customerRecordId,
  rewardAmount,
  generatedAt,
}) {
  const validation = validateManualRewardInput({
    customerRecordId,
    rewardAmount,
    generatedAt,
  });
  if (!validation.ok) {
    const error = new Error(validation.message);
    error.status = 400;
    throw error;
  }

  return transaction(async (client) => {
    const customerRows = await client.query(
      'SELECT "id", "customerId", "name", "phoneNumber" FROM "Customer" WHERE "id" = $1 LIMIT 1 FOR UPDATE',
      [customerRecordId],
    );
    const customer = customerRows.rows[0];
    if (!customer) {
      const error = new Error("Select an existing customer.");
      error.status = 400;
      throw error;
    }

    const duplicateRows = await client.query(
      `SELECT "rewardId" FROM "Reward"
       WHERE "customerRecordId" = $1
         AND "source" = 'Manual'
         AND "generatedAt" = $2::date
         AND "rewardAmount" = $3
       LIMIT 1 FOR UPDATE`,
      [customer.id, generatedAt, validation.amount],
    );
    if (duplicateRows.rows.length) {
      const error = new Error(
        `This manual reward already exists (${duplicateRows.rows[0].rewardId}).`,
      );
      error.status = 409;
      throw error;
    }

    const outstandingRows = await client.query(
      `SELECT "id" FROM "Reward"
       WHERE "customerId" = $1
         AND (
           "status" = $2
           OR "status" = $3
         )
       LIMIT 1 FOR UPDATE`,
      [
        customer.customerId,
        REWARD_STATUS.APPLIED,
        REWARD_STATUS.ACTIVE,
      ],
    );
    if (outstandingRows.rows.length) {
      const error = new Error(
        "This customer already has an active or reserved reward.",
      );
      error.status = 409;
      throw error;
    }

    const expireDate = calculateExpiryDate(generatedAt);
    const lifecycle = getManualRewardLifecycle(expireDate);
    const rewardId = await generateRewardId(client);
    const result = await client.query(
      `INSERT INTO "Reward" (
        "id", "rewardId", "customerId", "customerRecordId", "customerName",
        "contactNumber", "rentalRequestId", "rentalDate", "rewardPercentage",
        "rewardAmount", "status", "generatedAt", "source", "expireDate",
        "appliedRentalId", "appliedDate", "usedDate", "expiredDate"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NULL, NULL, 0,
        $7, $8, $9, 'Manual', $10, NULL, NULL, NULL, $11
      )
      RETURNING *, "generatedAt"::text AS "generatedAt"`,
      [
        createId(),
        rewardId,
        customer.customerId,
        customer.id,
        customer.name,
        customer.phoneNumber || "",
        validation.amount,
        lifecycle.status,
        generatedAt,
        expireDate,
        lifecycle.expiredDate,
      ],
    );

    return result.rows[0];
  });
}

/**
 * Create reward after rental completion.
 */
export async function generateReward(rentalRequestId) {
  if (!rentalRequestId) {
    throw new Error("Rental Request ID is required.");
  }

  try {
    return await transaction(async (client) => {
      const rentalResult = await client.query(
        'SELECT * FROM "RentalRequest" WHERE "requestId" = $1 LIMIT 1 FOR UPDATE',
        [rentalRequestId],
      );
      const rental = rentalResult.rows[0];

      if (!rental) {
        throw new Error("Rental request not found.");
      }

      if (rental.status !== "Completed") {
        throw new Error(
          "Reward can only be generated after rental completion.",
        );
      }

      const existingRows = await client.query(
        'SELECT "id" FROM "Reward" WHERE "rentalRequestId" = $1 LIMIT 1',
        [rental.requestId],
      );
      if (existingRows.rows.length) {
        return {
          success: false,
          message: "Reward already generated.",
        };
      }

      if (!rental.customerId) {
        throw new Error("Customer ID missing.");
      }

      const customerResult = await client.query(
        'SELECT * FROM "Customer" WHERE "customerId" = $1 LIMIT 1 FOR UPDATE',
        [rental.customerId],
      );
      const customer = customerResult.rows[0];
      if (!customer) {
        throw new Error("Customer not found.");
      }

      await client.query(
        'UPDATE "Reward" SET "status" = $1, "expiredDate" = NOW() WHERE "customerId" = $2 AND "status" = $3 AND "expireDate" < NOW()',
        [REWARD_STATUS.EXPIRED, rental.customerId, REWARD_STATUS.ACTIVE],
      );

      const unconsumedRows = await client.query(
        'SELECT "id" FROM "Reward" WHERE "customerId" = $1 AND "status" IN ($2, $3) LIMIT 1 FOR UPDATE',
        [rental.customerId, REWARD_STATUS.ACTIVE, REWARD_STATUS.APPLIED],
      );
      if (unconsumedRows.rows.length) {
        return {
          success: false,
          skipped: true,
          message:
            "Reward skipped: customer already has an active or reserved reward.",
        };
      }

      const rewardAmount = calculateReward(rental.totalAmount);
      const rewardId = await generateRewardId(client);
      const expireDate = calculateExpiryDate(rental.updatedAt || new Date());
      const id = createId();

      const insertSql = `INSERT INTO "Reward" (
        "id", "rewardId", "customerId", "customerName", "contactNumber",
        "rentalRequestId", "rentalDate", "rewardPercentage",
        "rewardAmount", "status", "expireDate"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`;
      const rewardResult = await client.query(insertSql, [
        id,
        rewardId,
        customer.customerId,
        customer.name,
        customer.phoneNumber || rental.phone || "",
        rental.requestId,
        rental.bookingDate,
        REWARD_PERCENTAGE,
        rewardAmount,
        REWARD_STATUS.ACTIVE,
        expireDate,
      ]);

      return {
        success: true,
        reward: rewardResult.rows[0],
        message: "Reward created successfully.",
      };
    });
  } catch (error) {
    if (error.code === "23505") {
      return {
        success: false,
        skipped: true,
        message: "Reward already exists for this rental or customer.",
      };
    }
    throw error;
  }
}

/**
 * Generate reward automatically
 * after admin marks rental Completed.
 */
export async function generateRewardIfEligible(rentalRequestId) {
  try {
    return await generateReward(rentalRequestId);
  } catch (error) {
    console.error("[Reward Generation]", error.message);

    return {
      success: false,
      message: error.message,
    };
  }
}
