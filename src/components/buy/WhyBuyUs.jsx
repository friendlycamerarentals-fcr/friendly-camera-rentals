"use client";

import { motion } from "framer-motion";
import { FiShield, FiCheckCircle, FiTruck, FiHeadphones } from "react-icons/fi";

const features = [
  {
    icon: FiCheckCircle,
    title: "Genuine Products",
    description:
      "All equipment is carefully verified for authenticity and quality.",
  },
  {
    icon: FiShield,
    title: "Warranty Support",
    description:
      "Selected products come with warranty for complete peace of mind.",
  },
  {
    icon: FiTruck,
    title: "Pan India Shipping",
    description: "Fast and secure delivery available across India.",
  },
  {
    icon: FiHeadphones,
    title: "Expert Assistance",
    description: "Get professional guidance before making your purchase.",
  },
];

export default function WhyBuyUs() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full border border-[#F5A623]/20 bg-[#F5A623]/10 px-4 py-2 text-sm font-medium text-[#F5A623]">
            Why Choose Us
          </span>

          <h2 className="mt-5 font-heading text-3xl font-bold text-white md:text-5xl">
            Why Buy From Us?
          </h2>

          <p className="mt-4 text-zinc-400">
            Trusted by photographers and filmmakers for genuine equipment and
            reliable support.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                className="group rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#F5A623]/30"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5A623]/10 text-[#F5A623] transition-all duration-300 group-hover:scale-110">
                  <Icon size={26} />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
