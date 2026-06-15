"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function SplashLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center"
    >
      <motion.div
        initial={{
          scale: 0.6,
          opacity: 0,
        }}
        animate={{
          scale: 3.5,
          opacity: 1,
        }}
        transition={{
          duration: 3.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <Image
          src="/logo.png"
          alt="Friendly Camera Rentals"
          width={120}
          height={120}
          priority
          className="h-20 w-20 md:h-28 md:w-28 object-contain"
        />
      </motion.div>
    </motion.div>
  );
}
