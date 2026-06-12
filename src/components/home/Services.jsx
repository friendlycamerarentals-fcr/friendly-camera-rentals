"use client";

import { motion } from "framer-motion";
import services from "@/data/services";

export default function Services() {
  return (
    <section className="bg-black py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-400">
            Our Services
          </p>

          <h2 className="font-heading mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">
            Everything You Need for
            <span className="text-amber-400"> Photography</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            From camera rentals to professional editing, we provide complete
            solutions for photographers, videographers, and content creators.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                className="group cursor-pointer rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:bg-white/[0.07]"
              >
                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-black">
                  <Icon size={28} />
                </div>

                {/* Title */}
                <h3 className="font-heading mt-6 text-3xl font-semibold text-white">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="mt-3 leading-7 text-zinc-400">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
