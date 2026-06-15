"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaCamera, FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
      </div>

      {/* Decorative Rings */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/10" />

      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400"
        >
          <FaCamera size={40} />
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-heading text-7xl font-semibold md:text-9xl"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-heading mt-6 text-4xl md:text-5xl"
        >
          Lost <span className="text-amber-400">Focus</span>
        </motion.h2>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-400"
        >
          The page you're looking for isn't in frame. Explore our premium camera
          rentals and capture your next story.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 rounded-full bg-amber-500 px-8 py-4 font-semibold text-black shadow-[0_10px_30px_rgba(245,166,35,0.3)] transition-all duration-300 hover:scale-105 hover:bg-amber-400 cursor-pointer"
          >
            <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Go Home
          </Link>

          <Link
            href="/rental"
            className="group flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:text-amber-400 cursor-pointer"
          >
            Explore Rentals
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
