"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { useCart } from "@/context/CartContext";

export default function ProductDetails({ product }) {
  const defaultDuration = Object.keys(product.pricing)[0];
  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);
  const [priceKey, setPriceKey] = useState(0); // for price animation

  const selectedPrice = product.pricing[selectedDuration];
  const images = product.images?.length > 0 ? product.images : [product.image];

  const MAX_THUMBS = 4;
  const visibleThumbs = images.slice(0, MAX_THUMBS);
  const extraCount =
    images.length > MAX_THUMBS ? images.length - MAX_THUMBS : 0;

  // Touch / mouse swipe
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

  const handleDurationSelect = (duration) => {
    if (selectedDuration === duration) return;
    setSelectedDuration(duration);
    setPriceKey((k) => k + 1);
    toast.info(`${duration} rental selected.`);
  };

  const handleAddToCart = () => {
    if (!selectedDuration) {
      toast.warning("Please select a rental duration.");
      return;
    }

    if (!product.available) {
      toast.error(`${product.name} is currently unavailable for rent.`);
      return;
    }

    try {
      addToCart({
        id: product.id,
        name: product.name,
        category: product.category,
        image: images[selectedImage], // selected image
        duration: selectedDuration,
        price: selectedPrice,
        quantity: 1,
      });

      toast.success(`${product.name} added to cart successfully.`);
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 pt-14 pb-10 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[55%_45%] lg:items-start">
          {/* ── LEFT ── */}
          <div className="flex flex-col gap-3">
            {/* Gallery */}
            <div className="flex gap-2">
              {/* Vertical Thumbnails */}
              <div className="flex flex-col gap-2">
                {visibleThumbs.map((img, index) => {
                  const isLastSlot = index === MAX_THUMBS - 1 && extraCount > 0;
                  const isActive = selectedImage === index;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() =>
                        setSelectedImage(isLastSlot ? MAX_THUMBS - 1 : index)
                      }
                      className={`relative overflow-hidden rounded-lg border transition-all duration-300 cursor-pointer flex-shrink-0 ${
                        isActive && !isLastSlot
                          ? "border-amber-500 ring-2 ring-amber-500/30"
                          : "border-white/10 hover:border-amber-500/40"
                      }`}
                    >
                      <div className="relative w-[56px] h-[56px] md:w-[72px] md:h-[72px]">
                        <Image
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          sizes="72px"
                          className={`object-cover transition-all duration-300 ${isLastSlot ? "brightness-[0.3]" : isActive ? "brightness-100" : "brightness-75"}`}
                        />
                        {isLastSlot && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              +{extraCount + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Main Image */}
              <div
                className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/5 select-none cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  isDragging.current = false;
                }}
              >
                <div className="relative h-[260px] md:h-[380px] w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImage}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={images[selectedImage]}
                        alt={product.name}
                        fill
                        priority
                        draggable={false}
                        sizes="(max-width:768px) 100vw, 50vw"
                        className="object-cover pointer-events-none"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Arrows */}
                  {images.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white text-lg backdrop-blur-sm hover:bg-black/80 transition cursor-pointer z-10"
                      >
                        ‹
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white text-lg backdrop-blur-sm hover:bg-black/80 transition cursor-pointer z-10"
                      >
                        ›
                      </motion.button>
                    </>
                  )}

                  {/* Dot indicators */}
                  {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`rounded-full transition-all duration-300 cursor-pointer ${
                            selectedImage === i
                              ? "w-5 h-1.5 bg-amber-500"
                              : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Counter badge */}
                  {images.length > 1 && (
                    <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm z-10">
                      {selectedImage + 1} / {images.length}
                    </div>
                  )}

                  {/* Availability ribbon */}
                  <div
                    className={`absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm border ${
                      product.available
                        ? "bg-green-500/20 border-green-500/30 text-green-400"
                        : "bg-red-500/20 border-red-500/30 text-red-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${product.available ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                    />
                    {product.available ? "Available" : "Unavailable"}
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Duration */}
            <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold tracking-wide text-white/80">
                  Rental Duration
                </h2>
                <span className="text-[11px] text-zinc-500">
                  Select to update price
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                {Object.entries(product.pricing).map(([duration, price]) => (
                  <motion.button
                    key={duration}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDurationSelect(duration)}
                    className={`rounded-lg border px-2 py-2.5 text-center transition-all duration-300 cursor-pointer ${
                      selectedDuration === duration
                        ? "border-amber-500 bg-amber-500/10 shadow-[0_6px_20px_rgba(245,166,35,0.2)]"
                        : "border-white/10 bg-black/40 hover:border-amber-500/40"
                    }`}
                  >
                    <p className="text-[11px] font-medium capitalize text-white/70">
                      {duration}
                    </p>
                    <p className="mt-0.5 text-base font-bold text-amber-400">
                      ₹{price}
                    </p>
                  </motion.button>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT — sticky ── */}
          <div className="lg:sticky lg:top-20">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              {/* Category */}
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">
                {product.category}
              </p>

              {/* Title */}
              <h1 className="mt-2 text-xl font-bold leading-snug md:text-2xl">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`text-sm ${s <= Math.round(product.rating ?? 5) ? "text-amber-400" : "text-zinc-600"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs text-zinc-400">
                  {product.rating ?? "4.9"} ({product.reviewCount ?? "120"}{" "}
                  Reviews)
                </span>
              </div>

              <div className="mt-4 border-t border-white/10" />

              {/* Specs */}
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Brand</span>
                  <span className="font-medium">{product.brand}</span>
                </div>
                {product.model && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Model</span>
                    <span className="font-medium">{product.model}</span>
                  </div>
                )}
                {product.megapixels && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Sensor</span>
                    <span className="font-medium">{product.megapixels}</span>
                  </div>
                )}
                {product.batteries > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Batteries</span>
                    <span className="font-medium">
                      {product.batteries} Included
                    </span>
                  </div>
                )}
              </div>

              {/* Animated Price */}
              <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4">
                <p className="text-xs text-zinc-400">Selected Rental</p>
                <div className="mt-1.5 flex items-end gap-2">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={priceKey}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="text-3xl font-bold text-amber-400"
                    >
                      ₹{selectedPrice}
                    </motion.span>
                  </AnimatePresence>
                  <span className="mb-1 text-xs text-zinc-500 capitalize">
                    / {selectedDuration}
                  </span>
                </div>
              </div>

              {/* About */}
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  About Product
                </h3>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  {product.description ??
                    "Professional camera equipment for photography and videography."}
                </p>
              </div>

              {/* Availability badge */}
              <div className="mt-4">
                {product.available ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1.5 text-xs font-medium text-green-400 border border-green-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Available for Rent
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    Currently Unavailable
                  </span>
                )}
              </div>

              {/* CTA */}
              <motion.button
                whileHover={product.available ? { scale: 1.02 } : {}}
                whileTap={product.available ? { scale: 0.97 } : {}}
                disabled={!product.available}
                onClick={handleAddToCart}
                className={`mt-4 w-full rounded-xl py-3.5 text-sm font-semibold transition-all cursor-pointer ${
                  product.available
                    ? "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_8px_24px_rgba(245,166,35,0.25)]"
                    : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                }`}
              >
                {product.available ? "Add To Cart" : "Not Available"}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
