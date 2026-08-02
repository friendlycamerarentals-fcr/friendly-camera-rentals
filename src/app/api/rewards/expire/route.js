import { NextResponse } from "next/server";
import rewardService from "@/services/rewardService";

/**
 * POST /api/rewards/expire
 *
 * Manually expire rewards whose expiry date has passed.
 *
 * This route can be:
 * - Called by Admin
 * - Called by a Cron Job
 * - Called on Dashboard Load
 */
export async function POST() {
  try {
    const result = await rewardService.expireRewards();

    return NextResponse.json(
      {
        success: true,
        expiredCount: result.expiredCount,
        message:
          result.message ||
          `${result.expiredCount} reward(s) expired successfully.`,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[REWARD_EXPIRE]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to expire rewards.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * GET /api/rewards/expire
 *
 * Returns expiry statistics.
 */
export async function GET() {
  try {
    const stats = await rewardService.getRewardExpiryStats();

    return NextResponse.json(
      {
        success: true,
        statistics: stats,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[REWARD_EXPIRE_STATS]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to fetch reward statistics.",
      },
      {
        status: 500,
      },
    );
  }
}
