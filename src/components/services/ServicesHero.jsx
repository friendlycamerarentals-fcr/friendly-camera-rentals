"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ServicesHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 py-24 md:py-32">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-[#F5A623]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <span className="rounded-full border border-[#F5A623]/20 bg-[#F5A623]/10 px-4 py-2 text-sm font-medium text-[#F5A623]">
            OUR SERVICES
          </span>

          {/* Heading */}
          <h1 className="mt-6 font-heading text-4xl font-bold leading-tight text-white md:text-6xl">
            Creative Solutions
            <span className="block text-[#F5A623]">
              For Every Moment
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
            From professional photography and cinematic videography
            to album printing and 3D invitation websites, we bring
            your memories to life with creativity and technology.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#services"
              className="rounded-full bg-[#F5A623] px-8 py-4 font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-amber-400"
            >
              Explore Services
            </Link>

            <Link
              href="/contact"
              className="rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white transition-all duration-300 hover:border-[#F5A623] hover:text-[#F5A623]"
            >
              Contact Us
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-5 md:grid-cols-4">
            <div>
              <h3 className="text-3xl font-bold text-[#F5A623]">
                100+
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Happy Clients
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#F5A623]">
                50+
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Projects
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#F5A623]">
                3+
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Years Experience
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#F5A623]">
                24/7
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Support
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}