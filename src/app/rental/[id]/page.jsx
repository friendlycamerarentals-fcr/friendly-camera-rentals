import { notFound } from "next/navigation";

import ProductDetails from "@/components/rental/ProductDetails";
import prisma from "@/lib/prisma";

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;

  let product = null;

  try {
    product = await prisma.rentalProduct.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });
  } catch (error) {
    console.error("Failed to fetch rental product from database:", error);
  }

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
