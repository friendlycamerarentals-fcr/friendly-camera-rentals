import { notFound } from "next/navigation";

import rentalProducts from "@/data/rentalProducts";
import ProductDetails from "@/components/rental/ProductDetails";

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;

  const product = rentalProducts.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
