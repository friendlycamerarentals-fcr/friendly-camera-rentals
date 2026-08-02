import { NextResponse } from "next/server";
import { query } from "@/db/query";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const ids = [...new Set(items.map((item) => item?.id).filter(Boolean))];

    if (!ids.length) {
      return NextResponse.json(
        {
          success: true,
          data: {
            availableProducts: [],
            unavailableProducts: [],
          },
        },
        { status: 200 },
      );
    }

    const products = await query(
      `SELECT "id", "name", "available" FROM "RentalProduct" WHERE "id" = ANY($1)`,
      [ids],
    );

    const productsById = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    const unavailableProducts = items
      .map((item) => {
        const product = productsById[item.id];
        if (!product || product.available === false) {
          return {
            id: item.id,
            name: product?.name || item.name || "This product",
          };
        }
        return null;
      })
      .filter(Boolean)
      .reduce((unique, item) => {
        if (!unique.some((entry) => entry.id === item.id)) {
          unique.push(item);
        }
        return unique;
      }, []);

    const availableProducts = products
      .filter((product) => product.available !== false)
      .map((product) => ({
        id: product.id,
        name: product.name,
      }));

    return NextResponse.json({
      success: true,
      data: {
        availableProducts,
        unavailableProducts,
      },
    });
  } catch (error) {
    console.error("[RENTAL_PRODUCT_AVAILABILITY_POST]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to validate rental product availability",
      },
      { status: 500 },
    );
  }
}
