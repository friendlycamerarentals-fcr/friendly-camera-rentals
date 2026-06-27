"use client";

import { useMemo, useState, useEffect, useCallback } from "react";

import SearchBar from "@/components/rental/SearchBar";
import CategoryFilter from "@/components/rental/CategoryFilter";
import ProductCard from "@/components/rental/ProductCard";

export default function RentalPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (query) {
        params.set("search", query);
      }

      if (selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }

      const response = await fetch(
        `/api/rental-products?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load rental products.");
      }

      setProducts(result.data || []);
    } catch (fetchError) {
      console.error("Failed to fetch rental products:", fetchError);
      setError(fetchError.message || "Unable to load rental products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setQuery(searchTerm.trim());
  };

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
  }, [products]);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-400">
              Rental Equipment
            </p>

            <h1 className="font-heading mt-2 text-5xl font-semibold md:text-7xl">
              Explore Premium
              <span className="text-amber-400"> Gear</span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-zinc-400">
              Rent professional cameras, lenses and accessories for photography
              and videography.
            </p>
          </div>

          {/* Search */}
          <div className="mx-auto mt-12 max-w-4xl">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
            />
          </div>

          {/* Categories */}
          <div className="mt-8">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={(category) => {
                setSelectedCategory(category);
                setQuery(searchTerm.trim());
              }}
            />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <h2 className="font-heading text-3xl md:text-4xl">
              Available Products
            </h2>

            <p className="text-zinc-400">{products.length} Products Found</p>
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 py-20 text-center backdrop-blur-xl">
              <h3 className="font-heading text-4xl text-white">
                Loading Products...
              </h3>

              <p className="mt-4 text-zinc-400">
                Please wait while we load the latest rental gear.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 py-20 text-center backdrop-blur-xl">
              <h3 className="font-heading text-4xl text-white">
                Failed to load products
              </h3>

              <p className="mt-4 text-zinc-400">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 py-20 text-center backdrop-blur-xl">
              <h3 className="font-heading text-4xl text-white">
                No Products Found
              </h3>

              <p className="mt-4 text-zinc-400">
                Try another search keyword or category.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
