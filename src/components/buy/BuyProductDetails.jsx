"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function BuyProductDetails({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);

  const images = product.images?.length > 0 ? product.images : [product.image];

  const touchStartX = useRef(null);
  const mouseStartX = useRef(null);
  const isDragging = useRef(false);
  const MIN_SWIPE = 40;

  const prevImage = () =>
    setSelectedImage((p) => (p - 1 + images.length) % images.length);

  const nextImage = () => setSelectedImage((p) => (p + 1) % images.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) < MIN_SWIPE) return;
    delta > 0 ? nextImage() : prevImage();
  };

  const handleMouseDown = (e) => {
    mouseStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = mouseStartX.current - e.clientX;
    if (Math.abs(delta) < MIN_SWIPE) return;
    delta > 0 ? nextImage() : prevImage();
  };

  const handleWhatsApp = () => {
    const message = `Hi Friendly Camera Rentals,

I'm interested in purchasing:

📸 Product: ${product.name}
🏷 Brand: ${product.brand}
💰 Price: ₹${product.price.toLocaleString("en-IN")}

Please provide more details.`;

    const whatsappUrl = `https://wa.me/918639852224?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp...");
  };

  return (
    <main className="min-h-screen bg-black px-4 pb-10 pt-14 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* ✅ items-start is required — items-center breaks position:sticky */}
        <div className="grid gap-5 lg:grid-cols-[55%_45%] lg:items-start">
          {/* ── LEFT — sticky gallery ── */}
          {/* ✅ lg:sticky + lg:top-24 + lg:self-start are all required together */}
          {/* ✅ No overflow-hidden / overflow-auto / transform on this element or any parent */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
            <div className="flex gap-2">
              {/* Thumbnails */}
              <div className="flex flex-col gap-2">
                {images.map((img, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-lg border transition-all duration-300 ${
                      selectedImage === index
                        ? "border-[#F5A623] ring-2 ring-[#F5A623]/30"
                        : "border-white/10 hover:border-[#F5A623]/40"
                    }`}
                  >
                    <div className="relative h-[60px] w-[60px] md:h-[72px] md:w-[72px]">
                      <Image
                        src={img}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        sizes="72px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Main Image */}
              {/* ✅ No overflow-hidden here — it's on the inner rounded container only */}
              <div
                className="flex-1 cursor-grab select-none active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => (isDragging.current = false)}
              >
                <div className="relative h-[300px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:h-[500px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImage}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={images[selectedImage]}
                        alt={product.name}
                        fill
                        priority
                        draggable={false}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 700px"
                        className="object-cover pointer-events-none"
                        unoptimized
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Stock badge */}
                  <div
                    className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                      product.stock
                        ? "bg-green-500/20 text-green-400 border border-green-500/20"
                        : "bg-red-500/20 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {product.stock ? "in stock" : "Sold"}
                  </div>

                  {/* Image counter */}
                  <div className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs backdrop-blur-md tabular-nums">
                    {selectedImage + 1} / {images.length}
                  </div>

                  {/* Arrows */}
                  {images.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevImage}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-lg text-white backdrop-blur-md hover:bg-black/80 transition"
                      >
                        ‹
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextImage}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-lg text-white backdrop-blur-md hover:bg-black/80 transition"
                      >
                        ›
                      </motion.button>
                    </>
                  )}

                  {/* Dot indicators */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          aria-label={`Go to image ${i + 1}`}
                          className={`rounded-full transition-all duration-300 ${
                            selectedImage === i
                              ? "h-1.5 w-5 bg-[#F5A623]"
                              : "h-1.5 w-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Bottom gradient for dot visibility */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT — scrollable product info ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              {/* Category */}
              <p className="text-xs uppercase tracking-[0.3em] text-[#F5A623]">
                {product.category}
              </p>

              {/* Title */}
              <h1 className="mt-3 text-2xl font-bold md:text-3xl">
                {product.name}
              </h1>

              <div className="my-5 border-t border-white/10" />

              {/* Product info */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/5 py-2">
                  <span className="text-zinc-400">Brand</span>
                  <span>{product.brand}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-2">
                  <span className="text-zinc-400">Condition</span>
                  <span>{product.condition}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Warranty</span>
                  <span>{product.warranty}</span>
                </div>
              </div>

              {/* Price */}
              <div className="mt-6 rounded-2xl border border-[#F5A623]/20 bg-gradient-to-br from-[#F5A623]/10 to-[#F5A623]/5 p-5">
                <p className="text-[11px] uppercase tracking-widest text-zinc-500">
                  Purchase Price
                </p>
                <h2 className="mt-1.5 text-4xl font-bold text-[#F5A623] tabular-nums">
                  ₹{product.price.toLocaleString("en-IN")}
                </h2>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    About Product
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Specifications
                  </h3>
                  <div className="mt-4 space-y-0">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between border-b border-white/5 py-2.5 text-sm last:border-0"
                        >
                          <span className="capitalize text-zinc-400">
                            {key}
                          </span>
                          <span className="text-white">{value}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Accessories */}
              {product.accessories?.length > 0 && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Included Accessories
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {product.accessories.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-zinc-300"
                      >
                        <span className="mt-0.5 text-[#F5A623]">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <motion.button
                whileHover={{
                  scale: 1.015,
                  boxShadow: "0 12px 32px rgba(245,166,35,0.35)",
                }}
                whileTap={{ scale: 0.975 }}
                onClick={handleWhatsApp}
                className="mt-6 w-full rounded-2xl bg-[#F5A623] py-4 font-semibold text-black shadow-[0_8px_24px_rgba(245,166,35,0.25)] transition-colors hover:bg-amber-400"
              >
                Buy via WhatsApp
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
