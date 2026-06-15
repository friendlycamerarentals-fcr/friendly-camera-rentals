"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle, FiX } from "react-icons/fi";

export default function SellSuccessModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed left-1/2 top-1/2 z-[9999] w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <FiX size={18} />
            </button>

            {/* Success Icon */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <FiCheckCircle size={54} />
            </div>

            {/* Content */}
            <div className="mt-6 text-center">
              <h2 className="font-heading text-3xl font-bold text-white">
                Request Submitted
              </h2>

              <p className="mt-4 leading-7 text-zinc-400">
                Your sell request has been submitted successfully. Our team will
                review your equipment and contact you soon.
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="mt-8 w-full rounded-2xl bg-[#F5A623] py-4 font-semibold text-black transition-all duration-300 hover:bg-amber-400"
            >
              Continue Browsing
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
