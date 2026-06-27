"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize, X } from "lucide-react";

import SellRequestStatusBadge from "./SellRequestStatusBadge";

export default function SellRequestModal({
  open,
  onClose,
  request,
  onStatusChange,
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);

  const images = useMemo(
    () =>
      request && Array.isArray(request.images)
        ? request.images.filter(Boolean)
        : [],
    [request?.images],
  );

  const accessories = useMemo(() => {
    if (!request || !request.accessories) return [];
    if (Array.isArray(request.accessories))
      return request.accessories.filter(Boolean);
    return request.accessories
      .split(/[,;\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }, [request?.accessories]);

  const handlePrevImage = () =>
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  const handleNextImage = () =>
    setSelectedImage((prev) => (prev + 1) % images.length);

  if (!open || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-h-[90vh] w-full max-w-7xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-zinc-950/95 p-6 backdrop-blur-md">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Sell Request Details
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Review customer request
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-black/30 p-2 text-zinc-400 transition hover:border-white/20 hover:text-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.9fr]">
          {/* Gallery */}
          <section className="space-y-5 rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Product Gallery
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Browse uploaded sell request images.
                </p>
              </div>
              {images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsFullViewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white transition hover:border-[#F5A623]/50 hover:bg-[#F5A623]/10"
                >
                  <Maximize size={16} />
                  View full image
                </button>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[90px_minmax(0,1fr)]">
              <div className="hidden lg:flex flex-col gap-3">
                {images.length > 0 ? (
                  images.map((image, index) => {
                    const isActive = selectedImage === index;
                    return (
                      <button
                        key={image + index}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={`relative overflow-hidden rounded-3xl border p-1 transition-all duration-300 ${
                          isActive
                            ? "border-[#F5A623] shadow-[0_0_0_3px_rgba(245,166,35,0.12)]"
                            : "border-white/10 hover:border-[#F5A623]/50"
                        }`}
                      >
                        <div className="relative h-[90px] w-full rounded-3xl bg-white/5">
                          <Image
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            sizes="90px"
                            className="rounded-3xl object-cover"
                          />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex h-full items-center justify-center rounded-3xl border border-white/10 bg-black/30 p-6 text-center text-zinc-500">
                    No images available
                  </div>
                )}
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/10">
                {images.length > 0 ? (
                  <div className="relative h-[320px] sm:h-[380px] md:h-[440px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={images[selectedImage]}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={images[selectedImage]}
                          alt={`Product image ${selectedImage + 1}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          className="object-cover"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2 text-white transition hover:bg-black/70"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2 text-white transition hover:bg-black/70"
                          aria-label="Next image"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                      {images.length > 0
                        ? `${selectedImage + 1} / ${images.length}`
                        : "0 / 0"}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[260px] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-black/30 p-6 text-center text-zinc-500">
                    No images uploaded for this request.
                  </div>
                )}
              </div>
            </div>

            {(accessories.length > 0 || request.description) && (
              <div className="space-y-5 lg:mt-4">
                {accessories.length > 0 && (
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <h3 className="mb-4 text-lg font-semibold text-white">
                      Accessories Included
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {accessories.map((item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {request.description && (
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-white">
                        Product Description
                      </h3>
                      <span className="text-sm text-zinc-500">Details</span>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-zinc-400 leading-7">
                      {request.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Customer Details
              </h3>
              <div className="space-y-3">
                <InfoRow label="Name" value={request.fullName} />
                <InfoRow label="Mobile" value={request.mobile} />
                <InfoRow label="Email" value={request.email} />
                <InfoRow label="City" value={request.city} />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Product Details
              </h3>
              <div className="space-y-3">
                <InfoRow label="Category" value={request.category} />
                <InfoRow label="Brand" value={request.brand} />
                <InfoRow label="Model" value={request.model} />
                <InfoRow label="Purchase Year" value={request.purchaseYear} />
                <InfoRow label="Warranty" value={request.warrantyStatus} />
                <InfoRow label="Condition" value={request.condition} />
              </div>
            </div>

            <div className="rounded-3xl border border-[#F5A623]/20 bg-[#F5A623]/10 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                Expected Selling Price
              </p>
              <p className="mt-2 text-4xl font-bold text-[#F5A623]">
                ₹{Number(request.expectedPrice || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Status</h3>
              <div className="flex flex-wrap items-center gap-3">
                <SellRequestStatusBadge status={request.status} />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Update Status
              </h3>
              <select
                value={request.status}
                onChange={(e) => onStatusChange(request.id, e.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-[#F5A623]"
              >
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFullViewOpen && images.length > 0 && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative h-full w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950 shadow-2xl">
              <button
                type="button"
                onClick={() => setIsFullViewOpen(false)}
                className="absolute right-4 top-4 z-20 inline-flex items-center justify-center rounded-full border border-white/10 bg-black/50 p-2 text-white transition hover:bg-black/80"
                aria-label="Close full view"
              >
                <X size={20} />
              </button>

              <div className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 gap-3">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="rounded-full border border-white/10 bg-black/50 p-2 text-white transition hover:bg-black/80"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="rounded-full border border-white/10 bg-black/50 p-2 text-white transition hover:bg-black/80"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="relative h-full w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`full-${images[selectedImage]}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={images[selectedImage]}
                      alt={`Full view image ${selectedImage + 1}`}
                      fill
                      sizes="100vw"
                      className="object-contain"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-sm">
                {selectedImage + 1} / {images.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3 last:border-b-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="max-w-[55%] text-right text-sm font-medium text-white">
        {value || "-"}
      </span>
    </div>
  );
}
