"use client";

import { motion } from "framer-motion";
import { FaShieldAlt, FaCamera, FaHeadset, FaStar } from "react-icons/fa";

const features = [
  {
    icon: FaCamera,
    title: "Premium Equipment",
    description:
      "Access professional cameras, lenses, and accessories from trusted brands.",
  },
  {
    icon: FaShieldAlt,
    title: "Trusted Service",
    description:
      "Reliable equipment and customer-first service for every creator.",
  },
  {
    icon: FaHeadset,
    title: "24/7 Support",
    description: "Get quick assistance and support whenever you need it.",
  },
  {
    icon: FaStar,
    title: "Affordable Pricing",
    description: "Premium quality gear and services at competitive prices.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-black py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-400">
            Why Choose Us
          </p>

          <h2 className="font-heading mt-4 text-4xl font-semibold leading-tight text-white md:text-6xl">
            Trusted by
            <span className="text-amber-400"> Creators</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            We provide professional camera equipment and creative services with
            reliability, quality, and customer satisfaction.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                className="group min-w-0 cursor-pointer"
              >
                <div className="group flex min-h-40 w-full min-w-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:bg-white/[0.07] sm:aspect-square sm:min-h-60 sm:p-5 lg:aspect-auto lg:min-h-0 lg:p-6">
                  {/* Icon */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-black sm:h-12 sm:w-12 sm:rounded-2xl lg:h-14 lg:w-14">
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading mt-1.5 text-base leading-tight font-semibold text-white sm:mt-4 sm:text-xl lg:mt-6 lg:text-3xl">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 text-xs leading-[1.15] text-zinc-400 sm:mt-3 sm:text-sm sm:leading-6 lg:text-base lg:leading-7">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
