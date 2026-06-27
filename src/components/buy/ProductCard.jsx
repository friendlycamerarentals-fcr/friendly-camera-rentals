"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const getStatus = (product) =>
  product.status || (product.stock ? "In Stock" : "Out of Stock");

export default function ProductCard({ product }) {
  const imageUrl = product.image?.trim() || null;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl"
    >
      {/* Image */}
      <div className="relative h-72 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="h-full w-full bg-white/5" />
        )}

        {/* Category Badge */}
        <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {product.category}
        </span>

        {/* Condition Badge */}
        <span className="absolute right-4 top-4 rounded-full bg-[#F5A623] px-3 py-1 text-xs font-semibold text-black">
          {product.condition}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        <div>
          <p className="text-sm text-zinc-400">{product.brand}</p>

          <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-white">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-[#F5A623]">
              ₹{product.price.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {product.warranty} Warranty
            </p>
          </div>

          {(() => {
            const status = getStatus(product);
            const isInStock = status === "In Stock";

            return (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isInStock
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {status}
              </span>
            );
          })()}
        </div>

        {/* Button */}
        <Link
          href={`/buy/${product.slug}`}
          className="block w-full rounded-2xl bg-[#F5A623] py-3 text-center font-semibold text-black transition-all duration-300 hover:bg-amber-400"
        >
          View Product
        </Link>
      </div>
    </motion.div>
  );
}
