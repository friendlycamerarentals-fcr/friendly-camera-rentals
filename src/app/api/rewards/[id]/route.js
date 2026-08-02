import { NextResponse } from "next/server";
import rewardService from "@/services/rewardService";

/**
 * GET /api/rewards/:id
 * Returns complete reward details.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const reward = await rewardService.getReward(id);

    if (!reward) {
      return NextResponse.json(
        {
          success: false,
          message: "Reward not found.",
        },
        {
          status: 404,
        },
      );
    }

    const history = await rewardService.getCustomerHistory(reward.customerId);

    return NextResponse.json(
      {
        success: true,
        reward,
        history,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[REWARD_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reward.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * PATCH /api/rewards/:id
 * Update reward status manually.
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    const body = await request.json();

    const reward = await rewardService.getReward(id);

    if (!reward) {
      return NextResponse.json(
        {
          success: false,
          message: "Reward not found.",
        },
        {
          status: 404,
        },
      );
    }

    const updatedReward = await rewardService.updateReward(id, body);

    return NextResponse.json(
      {
        success: true,
        reward: updatedReward,
        message: "Reward updated successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[REWARD_PATCH]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update reward.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * DELETE /api/rewards/:id
 * Delete reward record.
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const reward = await rewardService.getReward(id);

    if (!reward) {
      return NextResponse.json(
        {
          success: false,
          message: "Reward not found.",
        },
        {
          status: 404,
        },
      );
    }

    await rewardService.deleteReward(id);

    return NextResponse.json(
      {
        success: true,
        message: "Reward deleted successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[REWARD_DELETE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete reward.",
      },
      {
        status: 500,
      },
    );
  }
}
