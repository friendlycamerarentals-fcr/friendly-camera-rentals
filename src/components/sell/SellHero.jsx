"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function SellHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#F5A623]/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-28 text-center md:px-6 lg:px-8 lg:py-36">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="inline-block rounded-full border border-[#F5A623]/20 bg-[#F5A623]/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#F5A623]"
        >
          Sell Your Gear
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mx-auto mt-8 max-w-4xl font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
        >
          Turn Your Camera Equipment Into{" "}
          <span className="text-[#F5A623]">Cash</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg"
        >
          Sell your cameras, lenses, drones and accessories with confidence. Get
          the best market value and receive offers from our team quickly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="#sell-form"
            className="rounded-full bg-[#F5A623] px-8 py-4 font-semibold text-black shadow-[0_10px_40px_rgba(245,166,35,0.25)] transition-all duration-300 hover:scale-105 hover:bg-amber-400"
          >
            Sell Your Equipment
          </Link>

          <Link
            href="/rental"
            className="rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:border-[#F5A623] hover:text-[#F5A623]"
          >
            Explore Rentals
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { value: "500+", label: "Products Sold" },
            { value: "1000+", label: "Happy Customers" },
            { value: "24 Hrs", label: "Quick Response" },
            { value: "100%", label: "Secure Deals" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <h3 className="text-2xl font-bold text-[#F5A623] md:text-3xl">
                {item.value}
              </h3>

              <p className="mt-2 text-sm text-zinc-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
