import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
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
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      },
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

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const reward = await rewardService.createManualReward({
      customerRecordId: body?.customerRecordId,
      rewardAmount: body?.rewardAmount,
      generatedAt: body?.generatedAt,
    });

    return NextResponse.json(
      {
        success: true,
        reward,
        message: "Manual reward created successfully.",
      },
      {
        status: 201,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      },
    );
  } catch (error) {
    console.error("[MANUAL_REWARD_CREATE]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create manual reward.",
      },
      { status: error.status || (error.code === "23505" ? 409 : 500) },
    );
  }
}
