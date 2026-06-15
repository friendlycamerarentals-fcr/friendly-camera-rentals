"use client";

import { motion } from "framer-motion";
import { FiAward, FiClock, FiUsers, FiShield } from "react-icons/fi";

const features = [
  {
    icon: FiAward,
    title: "Professional Quality",
    description:
      "We use premium equipment and creative expertise to deliver outstanding results.",
  },
  {
    icon: FiClock,
    title: "On-Time Delivery",
    description:
      "Your photos, videos, albums and digital projects are delivered on schedule.",
  },
  {
    icon: FiUsers,
    title: "Experienced Team",
    description:
      "Our skilled photographers, editors and designers bring years of experience.",
  },
  {
    icon: FiShield,
    title: "Trusted Service",
    description:
      "Hundreds of clients trust us for capturing and preserving their memories.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full border border-[#F5A623]/20 bg-[#F5A623]/10 px-4 py-2 text-sm font-medium text-[#F5A623]">
            WHY CHOOSE US
          </span>

          <h2 className="mt-5 font-heading text-3xl font-bold text-white md:text-5xl">
            Trusted Creative Partner
          </h2>

          <p className="mt-4 text-zinc-400">
            We combine creativity, technology and experience to deliver
            exceptional visual experiences.
          </p>
        </div>

        {/* Feature Cards */}
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
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#F5A623]/30 cursor-pointer"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5A623]/10 text-[#F5A623] transition-all duration-300 group-hover:scale-110">
                  <Icon size={28} />
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
