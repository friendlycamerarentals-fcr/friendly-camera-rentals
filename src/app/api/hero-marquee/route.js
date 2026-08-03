import { NextResponse } from "next/server";
import { createId } from "@/lib/createId";
import { query } from "@/db/query";
import {
  getCachedValue,
  setCachedValue,
  invalidateCachePrefix,
} from "@/lib/dataCache";
import {
  ensureHeroMarqueeTable,
  heroMarqueeSelectColumns,
  normalizeHeroMarqueeText,
} from "@/lib/heroMarquee";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getCacheKey = () => "/api/hero-marquee";

export async function GET(request) {
  const cacheKey = getCacheKey();
  const cachedPayload = getCachedValue(cacheKey);

  if (cachedPayload !== null) {
    return NextResponse.json(cachedPayload);
  }

  try {
    await ensureHeroMarqueeTable();
    const rows = await query(
      `SELECT ${heroMarqueeSelectColumns.join(", ")} FROM "HeroMarquee" WHERE "isActive" = TRUE ORDER BY "display_order" ASC, "createdAt" ASC`,
    );

    const payload = { success: true, data: rows };
    setCachedValue(cacheKey, payload, 30_000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[HERO_MARQUEE_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch hero marquee items" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await ensureHeroMarqueeTable();
    const text = normalizeHeroMarqueeText(body?.text || "");

    if (!text) {
      return NextResponse.json(
        { success: false, message: "Marquee text is required" },
        { status: 400 },
      );
    }

    if (text.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Marquee text must be 150 characters or fewer",
        },
        { status: 400 },
      );
    }

    const id = createId();
    const rows = await query(
      `WITH next_display AS (
        SELECT COALESCE(MAX("display_order"), -1) + 1 AS "next_display_order"
        FROM "HeroMarquee"
      )
      INSERT INTO "HeroMarquee" ("id", "text", "isActive", "display_order")
      SELECT $1, $2, $3, "next_display_order"
      FROM next_display
      RETURNING ${heroMarqueeSelectColumns.join(", ")}`,
      [id, text, body?.isActive !== false],
    );

    invalidateCachePrefix("/api/hero-marquee");
    return NextResponse.json({ success: true, data: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("[HERO_MARQUEE_POST]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create hero marquee item" },
      { status: 500 },
    );
  }
}
