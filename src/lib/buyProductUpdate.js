import { isSoldStatusTransition } from "./adminActivity.js";

export function normalizeBuyProductStatus(status) {
  if (!status) return "In Stock";

  const value = String(status).trim().toLowerCase();

  if (value === "available" || value === "in stock") {
    return "In Stock";
  }

  if (value === "reserved" || value === "out of stock") {
    return "Out of Stock";
  }

  if (value === "sold") {
    return "Sold";
  }

  return status;
}

export async function updateBuyProductWithSoldEvent(client, id, body) {
  const existingRows = await client.query(
    'SELECT * FROM "BuyProduct" WHERE "id" = $1 FOR UPDATE',
    [id],
  );
  const existingProduct = existingRows.rows[0];

  if (!existingProduct) return { notFound: true };

  const updates = [];
  const values = [id];

  const pushValue = (column, value) => {
    if (value !== undefined) {
      updates.push(`"${column}" = $${values.length + 1}`);
      values.push(value);
    }
  };

  pushValue("name", body.name);
  pushValue("slug", body.slug);
  pushValue("brand", body.brand);
  pushValue("model", body.model);
  pushValue("category", body.category);
  pushValue("condition", body.condition);
  pushValue("warranty", body.warranty);
  if (body.status !== undefined) {
    pushValue("status", normalizeBuyProductStatus(body.status));
  }
  if (body.description !== undefined) pushValue("description", body.description);
  if (body.price !== undefined) pushValue("price", Number(body.price));
  if (body.image !== undefined) pushValue("image", body.image);
  if (body.images !== undefined) {
    pushValue(
      "images",
      Array.isArray(body.images) ? body.images : existingProduct.images || [],
    );
  }
  if (body.specifications !== undefined) {
    pushValue("specifications", body.specifications);
  }
  if (body.accessories !== undefined) {
    pushValue("accessories", body.accessories);
  }

  if (updates.length === 0) return { product: existingProduct };

  const rows = await client.query(
    `UPDATE "BuyProduct" SET ${updates.join(", ")} WHERE "id" = $1 RETURNING *`,
    values,
  );
  const product = rows.rows[0];

  if (isSoldStatusTransition(existingProduct.status, product.status)) {
    await client.query(
      `INSERT INTO "BuyProductSoldEvent"
        ("productId", "productName", "previousStatus", "newStatus")
       VALUES ($1, $2, $3, $4)`,
      [product.id, product.name, existingProduct.status, product.status],
    );
  }

  return { product };
}
