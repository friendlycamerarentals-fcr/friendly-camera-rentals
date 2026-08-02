import { NextResponse } from "next/server";
import rewardService from "@/services/rewardService";

/**
 * POST /api/rewards/generate
 *
 * Called after a rental is marked as Completed.
 *
 * Request Body:
 * {
 *   "rentalRequestId":"FCR-R100001"
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const { rentalRequestId } = body;

    if (!rentalRequestId) {
      return NextResponse.json(
        {
          success: false,
          message: "Rental Request ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const reward = await rewardService.generateReward(rentalRequestId);

    if (!reward) {
      return NextResponse.json(
        {
          success: false,
          message: "Reward could not be generated.",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        reward,
        message: "Reward generated successfully.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("[REWARD_GENERATE]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to generate reward.",
      },
      {
        status: 500,
      },
    );
  }
}
