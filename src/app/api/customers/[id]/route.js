import { NextResponse } from "next/server";
import { query } from "@/db/query";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const rows = await query(
      'SELECT * FROM "Customer" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    const customer = rows[0];

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("[CUSTOMER_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch customer",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const body = await request.json();

    const values = [id];
    const updates = [];

    if (body.phoneNumber !== undefined) {
      updates.push('"phoneNumber" = $' + (values.length + 1));
      values.push(body.phoneNumber);
    }

    if (body.address !== undefined) {
      updates.push('"address" = $' + (values.length + 1));
      values.push(body.address);
    }

    if (body.name !== undefined) {
      updates.push('"name" = $' + (values.length + 1));
      values.push(body.name);
    }

    if (!updates.length) {
      return NextResponse.json({ success: true, data: null });
    }

    const rows = await query(
      `UPDATE "Customer" SET ${updates.join(", ")} WHERE "id" = $1 RETURNING *`,
      values,
    );

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("[CUSTOMER_UPDATE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update customer",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await query('DELETE FROM "Customer" WHERE "id" = $1', [id]);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[CUSTOMER_DELETE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete customer",
      },
      {
        status: 500,
      },
    );
  }
}
