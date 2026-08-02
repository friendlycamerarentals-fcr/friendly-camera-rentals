import { NextResponse } from "next/server";
import rewardService from "@/services/rewardService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    let rewards = [];

    if (search) {
      rewards = await rewardService.searchRewards(search);
    } else if (status && status !== "All") {
      rewards = await rewardService.getRewardsByStatus(status);
    } else {
      rewards = await rewardService.getRewards();
    }

    const statistics = await rewardService.getStatistics();

    return NextResponse.json(
      {
        success: true,
        rewards,
        statistics,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[REWARDS_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch rewards.",
      },
      {
        status: 500,
      },
    );
  }
}
