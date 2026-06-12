"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight, FaWhatsapp } from "react-icons/fa";
import Counter from "@/components/ui/Counter";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-black">
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
          Premium cameras, lenses, and accessories for creators.
          We also provide photography, videography, photo editing,
          and video editing services.
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
          <Counter
            end={200}
            suffix="+"
            label="Happy Customers"
          />

          <Counter
            end={50}
            suffix="+"
            label="Equipment"
          />

          <Counter
            end={24}
            suffix="/7"
            label="Support"
          />

          <Counter
            end={100}
            suffix="%"
            label="Trusted Service"
          />
        </motion.div>
      </div>
    </section>
  );
}