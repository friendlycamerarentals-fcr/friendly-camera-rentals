"use client";

import { useEffect } from "react";
import BuyHero from "@/components/buy/BuyHero";
import ProductGrid from "@/components/buy/ProductGrid";
import WhyBuyUs from "@/components/buy/WhyBuyUs";
import BuyFAQ from "@/components/buy/BuyFAQ";
import { prefetchJson } from "@/lib/dataCache";

export default function BuyPageClient() {
  useEffect(() => {
    prefetchJson(
      "/api/buy-products",
      {},
      {
        cacheKey: "/api/buy-products",
        ttlMs: 30_000,
      },
    );
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <BuyHero />

      <section id="products">
        <ProductGrid />
      </section>

      <WhyBuyUs />

      <BuyFAQ />
    </main>
  );
}
