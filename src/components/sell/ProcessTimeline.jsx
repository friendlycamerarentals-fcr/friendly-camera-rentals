"use client";

import { motion } from "framer-motion";
import {
  FiUploadCloud,
  FiSearch,
  FiDollarSign,
  FiCheckCircle,
} from "react-icons/fi";

const steps = [
  {
    icon: FiUploadCloud,
    title: "Submit Your Gear",
    description: "Fill out the form and upload product images.",
  },
  {
    icon: FiSearch,
    title: "Expert Review",
    description: "Our team inspects and evaluates your equipment.",
  },
  {
    icon: FiDollarSign,
    title: "Get an Offer",
    description: "Receive the best market price for your gear.",
  },
  {
    icon: FiCheckCircle,
    title: "Complete Sale",
    description: "Accept the offer and receive payment securely.",
  },
];

export default function ProcessTimeline() {
  return (
    <section className="border-t border-white/10 bg-black py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-[#F5A623]">
            How It Works
          </span>

          <h2 className="mt-4 font-heading text-3xl font-bold md:text-5xl">
            Simple & Secure Selling Process
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Sell your equipment in just a few easy steps with complete
            transparency and professional support.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{
                  opacity: 0,
                  y: 80,
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
                  delay: index * 0.15,
                }}
                className="group relative rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#F5A623]/40"
              >
                {/* Step Number */}
                <div className="absolute right-5 top-5 text-5xl font-bold text-white/5">
                  0{index + 1}
                </div>

                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5A623]/10 text-[#F5A623] transition-all duration-300 group-hover:scale-110">
                  <Icon size={30} />
                </div>

                {/* Title */}
                <h3 className="mt-6 text-xl font-semibold text-white">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-3 leading-7 text-zinc-400">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
