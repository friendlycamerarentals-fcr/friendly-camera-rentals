"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import buyProducts from "@/data/buyProducts";
import CategoryFilter from "./CategoryFilter";

export default function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return buyProducts;

    return buyProducts.filter(
      (product) => product.category === selectedCategory,
    );
  }, [selectedCategory]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
      {/* Filter */}
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Results */}
      <div className="mt-10">
        <p className="text-sm text-zinc-400">
          Showing{" "}
          <span className="font-semibold text-[#F5A623]">
            {filteredProducts.length}
          </span>{" "}
          products
        </p>
      </div>

      {/* Products Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="mt-20 rounded-[32px] border border-white/10 bg-white/[0.03] p-12 text-center">
          <h3 className="text-2xl font-semibold text-white">
            No Products Found
          </h3>

          <p className="mt-3 text-zinc-400">
            Products for this category will be added soon.
          </p>
        </div>
      )}
    </section>
  );
}
