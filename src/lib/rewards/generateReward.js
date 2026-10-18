import { createId } from "@/lib/createId";
import { transaction } from "@/db/query";
import {
  REWARD_PERCENTAGE,
  REWARD_STATUS,
  REWARD_ID_PREFIX,
  REWARD_START_NUMBER,
} from "@/constants/rewardStatus";

import { calculateReward, calculateExpiryDate } from "./rewardValidation";

/**
 * Generate next Reward ID
 * Example:
 * RWD-100001
 * RWD-100002
 */
async function generateRewardId(client) {
  await client.query("SELECT pg_advisory_xact_lock(100001)");
  const result = await client.query(
    'SELECT "rewardId" FROM "Reward" ORDER BY "createdAt" DESC LIMIT 1',
  );
  const rows = result.rows;

  if (!rows.length) {
    return `${REWARD_ID_PREFIX}${REWARD_START_NUMBER}`;
  }

  const lastReward = rows[0];
  const lastNumber = Number(
    String(lastReward.rewardId || "").replace(REWARD_ID_PREFIX, "") || 0,
  );

  return `${REWARD_ID_PREFIX}${String(lastNumber + 1).padStart(6, "0")}`;
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
