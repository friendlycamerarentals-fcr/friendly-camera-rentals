"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ServiceCard({ service, active = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
      }}
      className={`group overflow-hidden rounded-2xl border bg-black transition-all duration-500 cursor-pointer
        ${
          active
            ? "border-[#D4AF37] shadow-[0_0_60px_rgba(212,175,55,0.25)]"
            : "border-white/10 hover:border-[#D4AF37]/50"
        }`}
    >
      {/* Image */}
      <div className="relative h-[200px] overflow-hidden">
        {service.image?.trim() ? (
          <Image
            src={service.image}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="h-full w-full bg-white/5" />
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="space-y-5 p-2">
        <h3 className="font-heading text-3xl leading-tight text-[#D4AF37]">
          {service.title}
        </h3>
        {/* Description */}{" "}
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          {" "}
          {service.description}{" "}
        </p>
      </div>
    </motion.div>
  );
}
