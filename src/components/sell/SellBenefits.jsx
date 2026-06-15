"use client";

import { motion } from "framer-motion";
import { FiDollarSign, FiShield, FiClock, FiCheckCircle } from "react-icons/fi";

const benefits = [
  {
    icon: FiDollarSign,
    title: "Best Market Price",
    description:
      "Get competitive offers for your cameras, lenses and accessories.",
  },
  {
    icon: FiClock,
    title: "Quick Response",
    description: "Our team reviews your request and responds within 24 hours.",
  },
  {
    icon: FiShield,
    title: "Secure Transactions",
    description: "Transparent and trusted buying process with secure payments.",
  },
  {
    icon: FiCheckCircle,
    title: "Verified Process",
    description: "Professional evaluation ensures fair pricing for your gear.",
  },
];

export default function SellBenefits() {
  return (
    <section className="border-b border-white/10 bg-black py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-[#F5A623]">
            Why Sell With Us
          </span>

          <h2 className="mt-4 font-heading text-3xl font-bold md:text-5xl">
            Trusted by Creators & Professionals
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Experience a simple, secure and transparent process to sell your
            photography equipment.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.div
                key={benefit.title}
                initial={{
                  opacity: 0,
                  y: 60,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.3,
                }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                }}
                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#F5A623]/30"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5A623]/10 text-[#F5A623] transition-all duration-300 group-hover:scale-110">
                  <Icon size={30} />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-white">
                  {benefit.title}
                </h3>

                <p className="mt-3 leading-7 text-zinc-400">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
