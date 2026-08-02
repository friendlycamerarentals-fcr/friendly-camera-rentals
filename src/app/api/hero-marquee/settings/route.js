import { NextResponse } from "next/server";
import { query } from "@/db/query";
import {
  getCachedValue,
  setCachedValue,
  invalidateCachePrefix,
} from "@/lib/dataCache";
import {
  ensureHeroMarqueeTable,
  heroMarqueeSettingsSelectColumns,
} from "@/lib/heroMarquee";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getCacheKey = () => "/api/hero-marquee/settings";

export async function GET() {
  const cacheKey = getCacheKey();
  const cachedPayload = getCachedValue(cacheKey);

  if (cachedPayload !== null) {
    return NextResponse.json(cachedPayload);
  }

  try {
    await ensureHeroMarqueeTable();
    const rows = await query(
      `SELECT ${heroMarqueeSettingsSelectColumns.join(", ")} FROM "HeroMarqueeSettings" WHERE "id" = 'global' LIMIT 1`,
    );

    const payload = {
      success: true,
      data: rows[0] || { id: "global", isEnabled: true },
    };

    setCachedValue(cacheKey, payload, 30_000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[HERO_MARQUEE_SETTINGS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch hero marquee settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    await ensureHeroMarqueeTable();
    const isEnabled = body?.isEnabled !== undefined ? body.isEnabled : true;

    const rows = await query(
      `UPDATE "HeroMarqueeSettings"
       SET "isEnabled" = $1,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = 'global'
       RETURNING ${heroMarqueeSettingsSelectColumns.join(", ")}`,
      [isEnabled],
    );

    if (!rows.length) {
      return NextResponse.json(
        { success: false, message: "Hero marquee settings not found" },
        { status: 404 },
      );
    }

    invalidateCachePrefix("/api/hero-marquee");
    invalidateCachePrefix("/api/hero-marquee/settings");
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("[HERO_MARQUEE_SETTINGS_PUT]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update hero marquee settings" },
      { status: 500 },
    );
  }
}
