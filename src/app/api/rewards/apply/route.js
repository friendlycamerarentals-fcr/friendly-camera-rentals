import { NextResponse } from "next/server";
import rewardService from "@/services/rewardService";

/**
 * POST /api/rewards/apply
 *
 * Apply customer's active reward to a rental request.
 *
 * Request Body:
 * {
 *   "customerId":"FCR-C10001",
 *   "rentalRequestId":"FCR-RQ-202606280001",
 *   "totalAmount":2500
 * }
 */
export async function POST(request) {
  try {
    await rewardService.expireRewards();

    const body = await request.json();

    const { customerId, rentalRequestId, totalAmount, productId } = body;

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer ID is required.",
        },
        { status: 400 },
      );
    }

    if (!rentalRequestId) {
      return NextResponse.json(
        {
          success: false,
          message: "Rental Request ID is required.",
        },
        { status: 400 },
      );
    }

    if (totalAmount === undefined || totalAmount === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Total amount is required.",
        },
        { status: 400 },
      );
    }

    const result = await rewardService.applyReward({
      customerId,
      rentalRequestId,
      totalAmount,
      productId,
    });

    return NextResponse.json(
      {
        success: true,
        rewardApplied: result.rewardApplied,
        reward: result.reward,
        rewardDiscount: result.rewardDiscount,
        finalAmount: result.finalAmount,
        message: result.message,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[REWARD_APPLY]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to apply reward.",
      },
      {
        status: 500,
      },
    );
  }
}
