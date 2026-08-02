import { NextResponse } from "next/server";
import { query } from "@/db/query";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const rows = await query(
      'SELECT * FROM "Testimonial" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    const testimonial = rows[0];

    if (!testimonial) {
      return NextResponse.json(
        { success: false, message: "Testimonial not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    console.error("[TESTIMONIAL_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch testimonial" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (
      body.status &&
      !["pending", "approved", "rejected"].includes(body.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid status. Must be 'pending', 'approved', or 'rejected'",
        },
        { status: 400 },
      );
    }

    const existingRows = await query(
      'SELECT * FROM "Testimonial" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    if (!existingRows[0]) {
      return NextResponse.json(
        { success: false, message: "Testimonial not found" },
        { status: 404 },
      );
    }

    const updateParts = [];
    const values = [];

    if (body.status) {
      updateParts.push('"status" = $' + (values.length + 1));
      values.push(body.status);
    }

    if (typeof body.featured === "boolean") {
      updateParts.push('"featured" = $' + (values.length + 1));
      values.push(body.featured);
    }

    if (!updateParts.length) {
      return NextResponse.json({ success: true, data: existingRows[0] });
    }

    values.push(id);
    const rows = await query(
      `UPDATE "Testimonial"
       SET ${updateParts.join(", ")}
       WHERE "id" = $${values.length}
       RETURNING *`,
      values,
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("[TESTIMONIAL_UPDATE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update testimonial" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const rows = await query(
      'SELECT * FROM "Testimonial" WHERE "id" = $1 LIMIT 1',
      [id],
    );

    if (!rows[0]) {
      return NextResponse.json(
        { success: false, message: "Testimonial not found" },
        { status: 404 },
      );
    }

    await query('DELETE FROM "Testimonial" WHERE "id" = $1', [id]);
    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("[TESTIMONIAL_DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete testimonial" },
      { status: 500 },
    );
  }
}
