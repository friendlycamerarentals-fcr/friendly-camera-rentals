import { NextResponse } from "next/server";
import rewardService from "@/services/rewardService";

/**
 * POST /api/rewards/check
 *
 * Check whether a customer has an active reward
 * before creating a rental request.
 *
 * Request:
 * {
 *   "customerId":"FCR-C10001"
 * }
 */
export async function POST(request) {
  try {
    await rewardService.expireRewards();

    const body = await request.json();

    const { customerId, productId } = body;

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const validation = await rewardService.checkReward(customerId, productId);
    const reward = validation?.valid ? validation.reward : null;

    if (!reward) {
      return NextResponse.json(
        {
          success: true,
          available: false,
          discount: 0,
          reward: null,
          message: "No active reward available.",
        },
        {
          status: 200,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        available: true,
        discount: reward.rewardAmount ?? reward.rewardPercentage ?? 0,
        reward,
        message: "Reward available.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[REWARD_CHECK]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to check reward.",
      },
      {
        status: 500,
      },
    );
  }
}
