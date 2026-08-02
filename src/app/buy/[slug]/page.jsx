import { notFound } from "next/navigation";
import BuyProductDetails from "@/components/buy/BuyProductDetails";
import { query } from "@/db/query";

async function getProductBySlug(slug) {
  try {
    const rows = await query(
      'SELECT * FROM "BuyProduct" WHERE "slug" = $1 LIMIT 1',
      [slug],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Failed to query buy product from DB:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} | Friendly Camera Rentals`,
    description: product.description || "",
  };
}

export default async function BuyProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <BuyProductDetails product={product} />;
}
