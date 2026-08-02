"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { useFetchData } from "@/hooks/useFetchData";
import CategoryFilter from "./CategoryFilter";
import ProductListSkeleton from "@/components/ui/ProductListSkeleton";

export default function ProductGrid() {
  const {
    data: allProducts,
    loading,
    error,
  } = useFetchData("/api/buy-products", {
    cacheKey: "/api/buy-products",
    ttlMs: 30_000,
  });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Use all products so out-of-stock and sold items remain visible
  const allVisibleProducts = useMemo(() => allProducts, [allProducts]);

  // Get unique categories from all visible products
  const categories = useMemo(() => {
    const uniqueCategories = [
      "All",
      ...new Set(allVisibleProducts.map((p) => p.category).filter(Boolean)),
    ];
    return uniqueCategories;
  }, [allVisibleProducts]);

  // Filter by category and search
  const filteredProducts = useMemo(() => {
    let filtered = allVisibleProducts;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) =>
          product.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.model?.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [allVisibleProducts, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <div className="mb-8 h-12 w-full max-w-xl animate-pulse rounded-2xl bg-white/10" />
        <div className="mb-6 h-12 w-full max-w-3xl animate-pulse rounded-2xl bg-white/10" />
        <ProductListSkeleton count={6} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <div className="rounded-[32px] border border-red-500/20 bg-red-500/5 p-12 text-center">
          <h3 className="text-2xl font-semibold text-white">Error</h3>
          <p className="mt-3 text-zinc-400">
            Failed to load products. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by product name, brand, or model..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-[#F5A623] focus:bg-white/5"
        />
      </div>

      {/* Filter */}
      <CategoryFilter
        categories={categories}
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
      {filteredProducts.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-20 rounded-[32px] border border-white/10 bg-white/[0.03] p-12 text-center">
          <h3 className="text-2xl font-semibold text-white">
            No Buy Products Available
          </h3>
          <p className="mt-3 text-zinc-400">
            {searchQuery
              ? "No products match your search. Try different keywords."
              : "New products coming soon!"}
          </p>
        </div>
      )}
    </section>
  );
}
