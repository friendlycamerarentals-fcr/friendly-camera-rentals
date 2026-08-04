"use client";

import Image from "next/image";
import { X } from "lucide-react";

const getStatus = (product) =>
  product.status || (product.stock ? "In Stock" : "Out of Stock");

export default function BuyProductModal({ open, onClose, product }) {
  if (!open || !product) return null;

  const images = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.image,
  ].filter(Boolean);
  const status = getStatus(product);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-white">Product Details</h2>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Images */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Product Images
            </h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-white/10"
                >
                  <Image
                    src={image}
                    alt={`${product.name}-${index}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Basic Details */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
            <h3 className="mb-6 text-lg font-semibold text-white">
              Product Information
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InfoItem label="Product Name" value={product.name} />

              <InfoItem label="Brand" value={product.brand} />

              <InfoItem label="Model" value={product.model} />

              <InfoItem label="Category" value={product.category} />

              <InfoItem label="Condition" value={product.condition} />

              <InfoItem label="Warranty" value={product.warranty || "N/A"} />

              <InfoItem label="Status" value={product.status} />

              <InfoItem
                label="Purchase Price"
                value={`₹${Number(product.price || 0).toLocaleString()}`}
              />
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Description
              </h3>

              <p className="leading-relaxed text-zinc-400">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {(() => {
            const specifications = Array.isArray(product.specifications)
              ? product.specifications
              : product.specifications &&
                  typeof product.specifications === "object"
                ? Object.entries(product.specifications).map(
                    ([label, value]) => ({
                      label,
                      value,
                    }),
                  )
                : [];

            return (
              specifications.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">
                    Specifications
                  </h3>

                  <div className="space-y-3">
                    {specifications.map((spec, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-white/10 p-4"
                      >
                        <span className="text-zinc-500">{spec.label}</span>

                        <span className="font-medium text-white">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            );
          })()}

          {/* Accessories */}
          {product.accessories?.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Included Accessories
              </h3>

              <div className="flex flex-wrap gap-3">
                {product.accessories.map((item, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-[#F5A623]/20 bg-[#F5A623]/10 px-4 py-2 text-sm text-[#F5A623]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-sm text-zinc-500">{label}</p>

      <p className="font-medium text-white">{value}</p>
    </div>
  );
}
