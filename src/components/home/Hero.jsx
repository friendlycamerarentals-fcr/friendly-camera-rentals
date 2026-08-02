"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaArrowRight, FaWhatsapp } from "react-icons/fa";
import Counter from "@/components/ui/Counter";
import { useEffect, useMemo, useState } from "react";
import { getHeroMarqueeVisibilityState } from "@/lib/heroMarqueeVisibility";

export default function Hero() {
  const [marqueeItems, setMarqueeItems] = useState([]);
  const [marqueeSettings, setMarqueeSettings] = useState({ isEnabled: true });
  const [loadingMarquee, setLoadingMarquee] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchMarquee() {
      try {
        const [itemsResponse, settingsResponse] = await Promise.all([
          fetch("/api/hero-marquee"),
          fetch("/api/hero-marquee/settings"),
        ]);

        const itemsData = await itemsResponse.json();
        const settingsData = await settingsResponse.json();

        if (!isMounted) return;

        if (itemsData.success) {
          setMarqueeItems(Array.isArray(itemsData.data) ? itemsData.data : []);
        }

        if (settingsData.success) {
          setMarqueeSettings(
            settingsData.data && typeof settingsData.data === "object"
              ? settingsData.data
              : { isEnabled: true },
          );
        }
      } catch (error) {
        console.error("Failed to fetch hero marquee items", error);
      } finally {
        if (isMounted) {
          setLoadingMarquee(false);
        }
      }
    }

    fetchMarquee();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibilityState = getHeroMarqueeVisibilityState({
    settings: marqueeSettings,
    items: marqueeItems,
  });
  const showMarquee = !loadingMarquee && visibilityState.isVisible;

  const marqueeContent = useMemo(() => {
    if (!marqueeItems.length) {
      return [];
    }

    const activeItems = marqueeItems.filter((item) => item?.isActive !== false);
    if (!activeItems.length) {
      return [];
    }

    const clones = 5;
    return Array.from({ length: clones }, (_, cloneIndex) => (
      <div key={`clone-${cloneIndex}`} className="flex shrink-0 items-center">
        {activeItems.map((item) => (
          <div
            key={`${cloneIndex}-${item.id}`}
            className="flex shrink-0 items-center gap-2 px-2 py-1 sm:gap-3 sm:px-3 md:gap-4 md:px-4 lg:gap-6 lg:px-6"
          >
            <span className="whitespace-nowrap font-[family-name:var(--font-cormorant)] text-[10px] font-bold uppercase tracking-[2px] text-amber-400 sm:text-[12px] md:text-[12px] lg:text-[14px]">
              {item.text}
            </span>
            <span className="text-[10px] text-amber-500/70 sm:text-[12px] md:text-[12px] lg:text-[14px]">
              ✦
            </span>
          </div>
        ))}
      </div>
    ));
  }, [marqueeItems]);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Glass Marquee */}
      {showMarquee && marqueeContent.length > 0 ? (
        <div className="absolute left-0 top-5 z-30 w-full overflow-hidden border-b border-white/20 bg-white/15 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="relative flex items-center overflow-hidden py-1">
            <div className="marquee-track flex w-max items-center text-[10px] motion-safe:animate-[marquee_22s_linear_infinite] sm:text-[12px] lg:text-[14px]">
              {marqueeContent}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70" />
        </div>
      ) : null}

      {/* Background Image */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/hero/photography.jpg"
          alt="Premium camera rental studio"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
      </div>

      {/* Decorative Gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_70%)]" />

      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center lg:px-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 rounded-full border border-amber-500/20 bg-amber-500/10 px-5 py-2 text-sm font-medium text-amber-400 backdrop-blur-md"
        >
          📸 Rent • Buy • Sell Professional Camera Equipment
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-heading max-w-5xl text-5xl font-semibold leading-none tracking-tight text-white md:text-7xl lg:text-8xl"
        >
          Capture Every{" "}
          <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-300 bg-clip-text text-transparent">
            Moment
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400 md:text-xl"
        >
          Premium cameras, lenses, and accessories for creators. We also provide
          photography, videography, photo editing, and video editing services.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/rental"
            className="group flex items-center justify-center gap-2 rounded-full bg-amber-500 px-8 py-4 font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-amber-400"
          >
            Explore Rentals
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <a
            href="https://wa.me/918639852224"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:border-amber-500 hover:text-amber-400"
          >
            <FaWhatsapp size={18} />
            Contact Us
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4 }}
          className="mt-24 grid grid-cols-2 gap-10 md:grid-cols-4"
        >
          <Counter end={200} suffix="+" label="Happy Customers" />

          <Counter end={20} suffix="+" label="Equipment" />

          <Counter end={24} suffix="/7" label="Support" />

          <Counter end={100} suffix="%" label="Trusted Service" />
        </motion.div>
      </div>
    </section>
  );
}
