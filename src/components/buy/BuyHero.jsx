"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiShield, FiTruck, FiCheckCircle } from "react-icons/fi";
import { RiCustomerService2Line } from "react-icons/ri";

export default function BuyHero() {
  const features = [
    {
      icon: FiCheckCircle,
      text: "100% Genuine Products",
    },
    {
      icon: FiShield,
      text: "Warranty Support",
    },
    {
      icon: FiTruck,
      text: "Pan India Shipping",
    },
    {
      icon: RiCustomerService2Line,
      text: "Expert Assistance",
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-white/10 py-24 md:py-32">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#F5A623]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="rounded-full border border-[#F5A623]/30 bg-[#F5A623]/10 px-4 py-2 text-sm font-medium text-[#F5A623]">
            Buy Professional Equipment
          </span>

          <h1 className="mt-6 font-heading text-4xl font-bold leading-tight text-white md:text-6xl">
            Buy Premium Cameras,
            <span className="block text-[#F5A623]">Lenses & Accessories</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
            Explore genuine cameras, lenses, drones and accessories carefully
            selected for photographers and filmmakers.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#products"
              className="rounded-full bg-[#F5A623] px-8 py-4 font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-amber-400"
            >
              Browse Products
            </Link>

            <Link
              href="/contact"
              className="rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white transition-all duration-300 hover:border-[#F5A623] hover:text-[#F5A623]"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5A623]/10 text-[#F5A623]">
                  <Icon size={22} />
                </div>

                <p className="text-sm font-medium text-zinc-300">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
