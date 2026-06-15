import { notFound } from "next/navigation";
import buyProducts from "@/data/buyProducts";
import BuyProductDetails from "@/components/buy/BuyProductDetails";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const product = buyProducts.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | Friendly Camera Rentals`,
    description: product.description,
  };
}

export default async function BuyProductPage({ params }) {
  const { slug } = await params;

  const product = buyProducts.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  return <BuyProductDetails product={product} />;
}
