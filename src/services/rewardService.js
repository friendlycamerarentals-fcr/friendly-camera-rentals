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

class RewardService {
  async getRewards() {
    await expireRewards();
    return query('SELECT * FROM "Reward" ORDER BY "createdAt" DESC');
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

    const validFields = [
      "status",
      "expireDate",
      "appliedDate",
      "usedDate",
      "expiredDate",
      "appliedRentalId",
      "rewardAmount",
    ];

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
      'SELECT * FROM "Reward" WHERE "rewardId" = $1 LIMIT 1',
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
      `SELECT * FROM "Reward"
       WHERE "rewardId" ILIKE $1
          OR "customerId" ILIKE $1
          OR "customerName" ILIKE $1
          OR "contactNumber" ILIKE $1
       ORDER BY "createdAt" DESC`,
      [pattern],
    );

    return rows;
  }

  async getRewardsByStatus(status) {
    await expireRewards();
    return query(
      'SELECT * FROM "Reward" WHERE "status" = $1 ORDER BY "createdAt" DESC',
      [status],
    );
  }

  async getCustomerHistory(customerId) {
    return query(
      'SELECT * FROM "Reward" WHERE "customerId" = $1 ORDER BY "createdAt" DESC',
      [customerId],
    );
  }
}

const rewardService = new RewardService();

export default rewardService;
