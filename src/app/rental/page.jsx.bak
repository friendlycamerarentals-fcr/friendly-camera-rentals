"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";

import SearchBar from "@/components/rental/SearchBar";
import CategoryFilter from "@/components/rental/CategoryFilter";
import ProductCard from "@/components/rental/ProductCard";
import ProductListSkeleton from "@/components/ui/ProductListSkeleton";
import { fetchJsonWithCache, prefetchJson } from "@/lib/dataCache";

export default function RentalPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchProducts = useCallback(async () => {
    console.log("Fetch start", { query, selectedCategory, loading });
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

      const url = `/api/rental-products?${params.toString()}`;
      const result = await fetchJsonWithCache(
        url,
        {},
        {
          cacheKey: url,
          ttlMs: 30_000,
        },
      );

      const data = result.data;
      console.log("API response:", data);

      if (!result.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load rental products.");
      }

      const productsList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

      console.log("Products:", productsList);
      if (isMountedRef.current) {
        setProducts(productsList);
      }
    } catch (fetchError) {
      console.error("Failed to fetch rental products:", fetchError);
      if (isMountedRef.current) {
        setError(fetchError.message || "Unable to load rental products.");
        setProducts([]);
      }
    } finally {
      console.log("Fetch end", { query, selectedCategory, loading });
      console.log("Loading:", loading);
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [query, selectedCategory, loading]);

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
          <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
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
            <div className="space-y-6">
              <div className="h-12 w-full max-w-2xl animate-pulse rounded-2xl bg-white/10" />
              <ProductListSkeleton count={6} />
            </div>
          ) : error ? (
            <div className="rounded-4xl border border-red-500/20 bg-red-500/5 py-20 text-center backdrop-blur-xl">
              <h3 className="font-heading text-4xl text-white">
                Failed to load products
              </h3>

              <p className="mt-4 text-zinc-400">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-4xl border border-white/10 bg-white/5 py-20 text-center backdrop-blur-xl">
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
