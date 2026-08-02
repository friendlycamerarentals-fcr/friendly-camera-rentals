import { notFound } from "next/navigation";

import ProductDetails from "@/components/rental/ProductDetails";
import { query } from "@/db/query";

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;

  let product = null;

  try {
    const rows = await query(
      'SELECT * FROM "RentalProduct" WHERE "id" = $1 OR "slug" = $2 LIMIT 1',
      [id, id],
    );
    product = rows[0] || null;
  } catch (error) {
    console.error("Failed to fetch rental product from database:", error);
  }

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
