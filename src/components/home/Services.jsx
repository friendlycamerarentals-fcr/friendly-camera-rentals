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
        <div className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                className="group flex aspect-square min-h-40 cursor-pointer flex-col rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:bg-white/[0.07] sm:min-h-60 sm:p-5 md:p-6 lg:aspect-auto lg:min-h-0 lg:p-8"
              >
                {/* Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-black sm:h-12 sm:w-12 sm:rounded-2xl lg:h-14 lg:w-14">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                </div>

                {/* Title */}
                <h3 className="font-heading mt-2 text-base leading-tight font-semibold text-white sm:mt-4 sm:text-xl lg:mt-8 lg:text-3xl">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="mt-2 line-clamp-3 text-xs leading-4 text-zinc-400 sm:mt-3 sm:line-clamp-none sm:text-sm sm:leading-6 lg:leading-7">
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
