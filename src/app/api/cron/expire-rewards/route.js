import { NextResponse } from "next/server";
import rewardService from "@/services/rewardService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await rewardService.expireRewards();

    return NextResponse.json(
      {
        success: true,
        expiredCount: result?.expiredCount ?? 0,
        message:
          result?.message ||
          `${result?.expiredCount ?? 0} reward(s) expired successfully.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[CRON_EXPIRE_REWARDS]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to expire rewards.",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}
