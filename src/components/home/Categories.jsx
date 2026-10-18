"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaCamera } from "react-icons/fa";
import { LuCamera, LuPackage } from "react-icons/lu";

const categories = [
  {
    icon: FaCamera,
    title: "Cameras",
    description: "Professional DSLR and mirrorless cameras for creators.",
    href: "/rental?category=camera",
  },
  {
    icon: LuCamera,
    title: "Lenses",
    description: "Wide-angle, portrait, telephoto, and cinematic lenses.",
    href: "/rental?category=lens",
  },
  {
    icon: LuPackage,
    title: "Accessories",
    description: "Tripods, gimbals, lights, batteries, and more.",
    href: "/rental?category=accessories",
  },
];

export default function Categories() {
  return (
    <section className="bg-black py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-400">
            Categories
          </p>

          <h2 className="font-heading mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">
            Explore Our
            <span className="text-amber-400"> Equipment</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Discover premium cameras, lenses, and accessories for photography
            and videography.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                className={`min-w-0 ${index === 2 ? "col-span-2 justify-self-center w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.5rem)] md:col-span-1 md:w-full" : ""}`}
              >
                <Link
                  href={category.href}
                  className="group flex aspect-square min-h-0 min-w-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:bg-white/[0.07] md:aspect-auto md:p-10"
                >
                  {/* Icon */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-black md:h-16 md:w-16 md:rounded-2xl">
                    <Icon className="h-3.5 w-3.5 md:h-8 md:w-8" />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading mt-0.5 text-base leading-tight font-semibold text-white sm:text-lg md:mt-8 md:text-4xl">
                    {category.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-0.5 text-xs leading-[1.15] text-zinc-400 md:mt-4 md:text-base md:leading-7">
                    {category.description}
                  </p>

                  {/* CTA */}
                  <div className="mt-auto pt-1 text-xs font-medium text-amber-400 md:mt-8 md:pt-0 md:text-sm">
                    Explore →
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
