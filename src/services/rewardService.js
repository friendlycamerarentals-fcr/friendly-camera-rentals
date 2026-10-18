import { query } from "@/db/query";

import {
  getActiveReward,
  validateReward,
} from "@/lib/rewards/rewardValidation";

import { generateReward } from "@/lib/rewards/generateReward";

import { applyReward, completeAppliedReward } from "@/lib/rewards/applyReward";

import {
  expireRewards,
  expireCustomerRewards,
  getRewardExpiryStats,
} from "@/lib/rewards/expireRewards";

const rewardSelect = `SELECT reward.*,
  (SELECT rental."requestId" FROM "RentalRequest" rental
   WHERE rental."rewardId" = reward."rewardId"
  ORDER BY rental."createdAt" DESC LIMIT 1) AS "lastAppliedRentalId",
  (SELECT rental."status" FROM "RentalRequest" rental
   WHERE rental."rewardId" = reward."rewardId"
  ORDER BY rental."createdAt" DESC LIMIT 1) AS "lastAppliedRentalStatus",
  (SELECT rental."updatedAt" FROM "RentalRequest" rental
   WHERE rental."rewardId" = reward."rewardId"
  ORDER BY rental."createdAt" DESC LIMIT 1) AS "lastAppliedRentalUpdatedAt"
  FROM "Reward" reward`;

class RewardService {
  async getRewards() {
    await expireRewards();
    return query(`${rewardSelect} ORDER BY reward."createdAt" DESC`);
  }

  async expireRewards() {
    return expireRewards();
  }

  async getRewardExpiryStats() {
    return getRewardExpiryStats();
  }

  async updateReward(rewardId, updates) {
    if (!rewardId) {
      throw new Error("Reward ID is required.");
    }

    const lifecycleFields = [
      "status",
      "appliedDate",
      "usedDate",
      "expiredDate",
      "appliedRentalId",
    ];
    if (lifecycleFields.some((field) => updates?.[field] !== undefined)) {
      throw new Error(
        "Reward lifecycle fields are managed by rental status changes.",
      );
    }

    const validFields = ["expireDate", "rewardAmount"];

    const payload = {};

    Object.entries(updates || {}).forEach(([key, value]) => {
      if (validFields.includes(key) && value !== undefined) {
        payload[key] = value;
      }
    });

    if (!Object.keys(payload).length) {
      throw new Error("No valid reward fields to update.");
    }

    const sets = [];
    const values = [];

    Object.entries(payload).forEach(([key, value]) => {
      sets.push(`"${key}" = $${values.length + 1}`);
      values.push(value);
    });

    values.push(rewardId);

    const rows = await query(
      `UPDATE "Reward" SET ${sets.join(", ")} WHERE "rewardId" = $${values.length} RETURNING *`,
      values,
    );

    return rows[0];
  }

  async getReward(rewardId) {
    if (!rewardId) {
      throw new Error("Reward ID is required.");
    }

    const rows = await query(
      `${rewardSelect} WHERE reward."rewardId" = $1 LIMIT 1`,
      [rewardId],
    );
    return rows[0] || null;
  }

  async getCustomerReward(customerId) {
    await expireCustomerRewards(customerId);
    return getActiveReward(customerId);
  }

  async checkReward(customerId, productId = null, productCategories = []) {
    await expireCustomerRewards(customerId);

    let category = null;

    if (productId) {
      const rows = await query(
        'SELECT "category" FROM "RentalProduct" WHERE "id" = $1 LIMIT 1',
        [productId],
      );
      category = rows[0]?.category || null;
    }

    return validateReward(customerId, category, productCategories);
  }

  async generateReward(rentalRequestId) {
    await expireRewards();
    return generateReward(rentalRequestId);
  }

  async applyReward(data) {
    await expireRewards();
    return applyReward(data);
  }

  async completeReward(rentalRequestId) {
    return completeAppliedReward(rentalRequestId);
  }

  async getStatistics() {
    await expireRewards();

    const stats = await getRewardExpiryStats();

    const totalRows = await query(
      'SELECT COUNT(*)::int AS count FROM "Reward"',
    );
    const totalAmountRows = await query(
      'SELECT COALESCE(SUM("rewardAmount")::float, 0) AS total FROM "Reward"',
    );

    return {
      totalRewards: Number(totalRows[0]?.count || 0),
      totalRewardAmount: Number(totalAmountRows[0]?.total || 0),
      activeRewards: stats.active,
      appliedRewards: stats.applied,
      usedRewards: stats.used,
      expiredRewards: stats.expired,
      expiringSoon: stats.expiringSoon,
      totalRewardValue: Number(totalAmountRows[0]?.total || 0),
    };
  }

  async searchRewards(search = "") {
    await expireRewards();

    if (!search) {
      return this.getRewards();
    }

    const pattern = `%${search}%`;
    const rows = await query(
      `${rewardSelect}
       WHERE reward."rewardId" ILIKE $1
         OR reward."customerId" ILIKE $1
         OR reward."customerName" ILIKE $1
         OR reward."contactNumber" ILIKE $1
       ORDER BY reward."createdAt" DESC`,
      [pattern],
    );

    return rows;
  }

  async getRewardsByStatus(status) {
    await expireRewards();
    return query(
      `${rewardSelect} WHERE reward."status" = $1 ORDER BY reward."createdAt" DESC`,
      [status],
    );
  }

  async getCustomerHistory(customerId) {
    return query(
      `${rewardSelect} WHERE reward."customerId" = $1 ORDER BY reward."createdAt" DESC`,
      [customerId],
    );
  }
}

const rewardService = new RewardService();

export default rewardService;
