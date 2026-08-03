import { createId } from "@/lib/createId";
import { query } from "@/db/query";
import {
  REWARD_PERCENTAGE,
  REWARD_STATUS,
  REWARD_ID_PREFIX,
  REWARD_START_NUMBER,
} from "@/constants/rewardStatus";

import {
  calculateReward,
  calculateExpiryDate,
  isRewardEligible,
  rewardExistsForRental,
} from "./rewardValidation";

/**
 * Generate next Reward ID
 * Example:
 * RWD-100001
 * RWD-100002
 */
async function generateRewardId() {
  const rows = await query(
    'SELECT "rewardId" FROM "Reward" ORDER BY "createdAt" DESC LIMIT 1',
  );

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

  const rentalRows = await query(
    'SELECT * FROM "RentalRequest" WHERE "requestId" = $1 LIMIT 1',
    [rentalRequestId],
  );
  const rental = rentalRows[0];

  if (!rental) {
    throw new Error("Rental request not found.");
  }

  if (rental.status !== "Completed") {
    throw new Error("Reward can only be generated after rental completion.");
  }

  const productRows = await query(
    'SELECT "category" FROM "RentalProduct" WHERE "id" = $1 LIMIT 1',
    [rental.productId],
  );

  if (!isRewardEligible(productRows[0]?.category)) {
    return {
      success: false,
      skipped: true,
      message: "Reward generation skipped: non-Camera rental.",
    };
  }

  const alreadyGenerated = await rewardExistsForRental(rental.requestId);

  if (alreadyGenerated) {
    return {
      success: false,
      message: "Reward already generated.",
    };
  }

  if (!rental.customerId) {
    throw new Error("Customer ID missing.");
  }

  const customerRows = await query(
    'SELECT * FROM "Customer" WHERE "customerId" = $1 LIMIT 1',
    [rental.customerId],
  );
  const customer = customerRows[0];

  if (!customer) {
    throw new Error("Customer not found.");
  }

  const rewardAmount = calculateReward(rental.totalAmount);
  const rewardId = await generateRewardId();
  const expireDate = calculateExpiryDate(rental.updatedAt || new Date());

  const id = createId();
  const rewardRows = await query(
    `INSERT INTO "Reward" (
      "id", "rewardId", "customerId", "customerName", "contactNumber",
      "rentalRequestId", "rentalDate", "rewardPercentage",
      "rewardAmount", "status", "expireDate"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
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
    ],
  );

  return {
    success: true,
    reward: rewardRows[0],
    message: "Reward created successfully.",
  };
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
