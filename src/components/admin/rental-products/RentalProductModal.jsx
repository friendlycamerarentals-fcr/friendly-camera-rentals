"use client";

import Image from "next/image";
import { X, Camera, Battery, CheckCircle2, XCircle } from "lucide-react";

export default function RentalProductModal({ open, onClose, product }) {
  if (!open || !product) return null;

  const images = [
    ...(Array.isArray(product.images) ? product.images.filter(Boolean) : []),
    product.image,
  ].filter(Boolean);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 shadow-[0_0_50px_rgba(245,166,35,0.1)]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-950 p-4 md:p-6">
          <div>
            <h2 className="text-xl font-bold text-white md:text-2xl">
              Product Details
            </h2>

            <p className="mt-1 text-sm text-zinc-500">{product.name}</p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Images */}
            <div>
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10">
                {product.image?.trim() ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-white/5" />
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.slice(1).map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-2xl border border-white/10"
                    >
                      <Image
                        src={img}
                        alt={`${product.name}-${index}`}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <h3 className="mb-4 text-lg font-semibold text-[#F5A623]">
                  Basic Information
                </h3>

                <div className="space-y-3 text-sm md:text-base">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Category</span>

                    <span className="capitalize text-white">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Brand</span>

                    <span className="text-white">{product.brand}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Model</span>

                    <span className="text-white">{product.model}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Megapixels</span>

                    <span className="text-white">{product.megapixels}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Batteries</span>

                    <span className="flex items-center gap-2 text-white">
                      <Battery size={16} />
                      {product.batteries}
                    </span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <h3 className="mb-4 text-lg font-semibold text-[#F5A623]">
                  Inventory
                </h3>

                <div className="flex flex-wrap gap-3">
                  {product.available ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-400">
                      <CheckCircle2 size={16} />
                      Available
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm text-red-400">
                      <XCircle size={16} />
                      Unavailable
                    </div>
                  )}

                  <div className="rounded-full bg-[#F5A623]/10 px-4 py-2 text-sm text-[#F5A623]">
                    Stock: {product.stock || 0}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <h3 className="mb-4 text-lg font-semibold text-[#F5A623]">
                  Rental Pricing
                </h3>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {Object.entries(product.pricing || {}).map(
                    ([key, value], idx) => (
                      <div
                        key={`${key || "pricing"}-${idx}`}
                        className="rounded-2xl border border-white/10 bg-zinc-900 p-3"
                      >
                        <p className="text-xs uppercase text-zinc-500">{key}</p>

                        <h4 className="mt-1 font-bold text-white">₹{value}</h4>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <h3 className="mb-4 text-lg font-semibold text-[#F5A623]">
                    Description
                  </h3>

                  <p className="leading-7 text-zinc-300">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
