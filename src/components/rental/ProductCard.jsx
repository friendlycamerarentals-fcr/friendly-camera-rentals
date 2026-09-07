"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  const imageUrl = product.image?.trim() || null;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl cursor-pointer border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_0_40px_rgba(245,158,11,0.12)]">
      {/* Image */}
      <div className="relative h-55 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-white/5" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className="absolute left-4 top-4 rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold capitalize text-black shadow-lg">
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </div>

        <div className="absolute right-4 bottom-4">
          {product.available ? (
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-500 backdrop-blur-md">
              Available
            </span>
          ) : (
            <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-500 backdrop-blur-md">
              Unavailable
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Brand */}
        <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
          {product.brand}
        </p>

        {/* Product Name */}
        <h3 className="font-heading mt-3 text-2xl leading-tight font-semibold text-white">
          {product.name}
        </h3>

        {/* Specifications */}
        <div className="mt-4 flex justify-around space-y-1.5 text-sm text-zinc-400">
          {product.megapixels != null && product.megapixels !== "" && (
            <span>{product.megapixels}</span>
          )}

          {product.batteries != null &&
            product.batteries !== "" &&
            product.batteries !== 0 && (
              <span>{product.batteries} Batteries Included</span>
            )}
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-2">
          {/* Price */}
          <div className="mb-4 inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400">
            From ₹{product.pricing["1hr"]}/hr
          </div>

          {/* Button */}
          <Link
            href={`/rental/${product.id}`}
            className="block w-full rounded-full bg-amber-500 py-2.5 text-center font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:bg-amber-400"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
}
