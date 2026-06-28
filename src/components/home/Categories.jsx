"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaCamera } from "react-icons/fa";
import { LuCamera, LuPackage } from "react-icons/lu";

const categories = [
  {
    icon: FaCamera,
    title: "Cameras",
    description:
      "Professional DSLR and mirrorless cameras for creators.",
    href: "/rental?category=camera",
  },
  {
    icon: LuCamera,
    title: "Lenses",
    description:
      "Wide-angle, portrait, telephoto, and cinematic lenses.",
    href: "/rental?category=lens",
  },
  {
    icon: LuPackage,
    title: "Accessories",
    description:
      "Tripods, gimbals, lights, batteries, and more.",
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
            Discover premium cameras, lenses, and accessories
            for photography and videography.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
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
              >
                <Link
                  href={category.href}
                  className="group block rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:bg-white/[0.07]"
                >
                  {/* Icon */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-black">
                    <Icon size={32} />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading mt-8 text-4xl font-semibold text-white">
                    {category.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-4 leading-7 text-zinc-400">
                    {category.description}
                  </p>

                  {/* CTA */}
                  <div className="mt-8 text-sm font-medium text-amber-400">
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
