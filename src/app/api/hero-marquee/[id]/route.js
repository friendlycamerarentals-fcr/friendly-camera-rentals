import { NextResponse } from "next/server";
import { query } from "@/db/query";
import { invalidateCachePrefix } from "@/lib/dataCache";
import {
  ensureHeroMarqueeTable,
  heroMarqueeSelectColumns,
  normalizeHeroMarqueeText,
} from "@/lib/heroMarquee";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await ensureHeroMarqueeTable();
    const body = await request.json();
    const text =
      body?.text === undefined
        ? undefined
        : normalizeHeroMarqueeText(body.text || "");

    if (text !== undefined && !text) {
      return NextResponse.json(
        { success: false, message: "Marquee text is required" },
        { status: 400 },
      );
    }

    if (text !== undefined && text.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Marquee text must be 150 characters or fewer",
        },
        { status: 400 },
      );
    }

    const fields = [];
    const values = [];

    if (text !== undefined) {
      fields.push('"text" = $1');
      values.push(text);
    }

    if (body?.isActive !== undefined) {
      fields.push('"isActive" = $' + (values.length + 1));
      values.push(body.isActive);
    }

    if (body?.display_order !== undefined) {
      fields.push('"display_order" = $' + (values.length + 1));
      values.push(Number(body.display_order) || 0);
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided" },
        { status: 400 },
      );
    }

    values.push(id);
    const rows = await query(
      `UPDATE "HeroMarquee" SET ${fields.join(", ")} WHERE "id" = $${values.length} RETURNING ${heroMarqueeSelectColumns.join(", ")}`,
      values,
    );

    if (!rows.length) {
      return NextResponse.json(
        { success: false, message: "Hero marquee item not found" },
        { status: 404 },
      );
    }

    invalidateCachePrefix("/api/hero-marquee");
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("[HERO_MARQUEE_PUT]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update hero marquee item" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await ensureHeroMarqueeTable();
    await query('DELETE FROM "HeroMarquee" WHERE "id" = $1', [id]);
    invalidateCachePrefix("/api/hero-marquee");
    return NextResponse.json({
      success: true,
      message: "Hero marquee item deleted",
    });
  } catch (error) {
    console.error("[HERO_MARQUEE_DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete hero marquee item" },
      { status: 500 },
    );
  }
}
