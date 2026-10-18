"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import ProductCard from "@/components/rental/ProductCard";
import ProductListSkeleton from "@/components/ui/ProductListSkeleton";
import { useFetchData } from "@/hooks/useFetchData";

const FEATURED_PRODUCT_COUNT = 3;

export default function FeaturedProducts() {
  const { data: products, loading, error } = useFetchData("/api/rental-products", {
    cacheKey: "/api/rental-products",
    ttlMs: 30_000,
  });

  const featuredProducts = products.slice(0, FEATURED_PRODUCT_COUNT);

  return (
    <section className="bg-[#080808] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">
              Featured Rentals
            </p>
            <h2 className="font-heading mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">
              Featured Rental Equipment
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
              Explore our camera gear available for rent.
            </p>
          </div>
          <Link href="/rental" className="hidden items-center gap-2 font-semibold text-amber-400 transition-colors hover:text-amber-300 sm:inline-flex">
            View All Rentals
            <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <ProductListSkeleton count={FEATURED_PRODUCT_COUNT} className="mt-10" />
        ) : error ? (
          <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
            <h3 className="font-heading text-3xl font-semibold text-white">Unable to load rental equipment</h3>
            <p className="mt-3 text-zinc-400">Please try again shortly.</p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <h3 className="font-heading text-3xl font-semibold text-white">No rental equipment available</h3>
            <p className="mt-3 text-zinc-400">Check back soon for new gear.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center sm:hidden">
          <Link href="/rental" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-semibold text-black transition-colors hover:bg-amber-400">
            View All Rentals
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="mt-8 hidden justify-center sm:flex">
          <Link href="/rental" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-semibold text-black transition-colors hover:bg-amber-400">
            View All Rentals
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}