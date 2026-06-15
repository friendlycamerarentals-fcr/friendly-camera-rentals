"use client";

import { motion } from "framer-motion";

const process = [
  {
    number: "01",
    title: "Consultation",
    description: "Understand your requirements, vision and event details.",
  },
  {
    number: "02",
    title: "Planning",
    description: "Plan the shoot, creative concepts and deliverables.",
  },
  {
    number: "03",
    title: "Creation",
    description: "Capture, edit and design with premium quality standards.",
  },
  {
    number: "04",
    title: "Delivery",
    description: "Deliver photos, videos, albums and digital assets on time.",
  },
];

export default function ProcessSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full border border-[#F5A623]/20 bg-[#F5A623]/10 px-4 py-2 text-sm font-medium text-[#F5A623]">
            OUR PROCESS
          </span>

          <h2 className="mt-5 font-heading text-3xl font-bold text-white md:text-5xl">
            How We Work
          </h2>

          <p className="mt-4 text-zinc-400">
            A streamlined process to transform your ideas into memorable
            experiences.
          </p>
        </div>

        {/* Process Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {process.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 cursor-pointer backdrop-blur-xl"
            >
              {/* Number */}
              <div className="text-5xl font-bold text-[#F5A623]/20">
                {step.number}
              </div>

              {/* Content */}
              <h3 className="mt-4 text-2xl font-semibold text-white">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {step.description}
              </p>

              {/* Glow */}
              <div className="absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-300 hover:opacity-100">
                <div className="absolute inset-0 rounded-[28px] bg-[#F5A623]/5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
