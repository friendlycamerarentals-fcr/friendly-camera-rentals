"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaWhatsapp, FaArrowRight } from "react-icons/fa";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-black py-24 md:py-32">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl md:p-16"
        >
          {/* Badge */}
          <p className="text-sm uppercase tracking-[0.35em] text-amber-400">
            Ready to Create?
          </p>

          {/* Heading */}
          <h2 className="font-heading mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">
            Need Equipment for Your
            <span className="text-amber-400"> Next Shoot?</span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Rent premium cameras, lenses, and accessories or
            connect with us for photography and videography services.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/rental"
              className="group flex items-center gap-2 rounded-full bg-amber-500 px-8 py-4 font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-amber-400"
            >
              Explore Rentals
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <a
              href="https://wa.me/918639852224"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:border-amber-500 hover:text-amber-400"
            >
              <FaWhatsapp size={18} />
              Contact on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
