"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";

const faqs = [
  {
    question: "Are all products genuine?",
    answer:
      "Yes. Every product listed is verified and inspected before being made available for sale.",
  },
  {
    question: "Do products come with warranty?",
    answer:
      "Selected products include warranty support. Warranty details are clearly mentioned on the product page.",
  },
  {
    question: "Is shipping available across India?",
    answer: "Yes, we offer secure shipping services across India.",
  },
  {
    question: "Can I inspect the product before buying?",
    answer:
      "Yes, product inspection can be arranged based on availability and location.",
  },
];

export default function BuyFAQ() {
  const [active, setActive] = useState(null);

  const toggleFAQ = (index) => {
    setActive(active === index ? null : index);
  };

  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <span className="rounded-full border border-[#F5A623]/20 bg-[#F5A623]/10 px-4 py-2 text-sm font-medium text-[#F5A623]">
            Frequently Asked Questions
          </span>

          <h2 className="mt-5 font-heading text-3xl font-bold text-white md:text-5xl">
            Got Questions?
          </h2>

          <p className="mt-4 text-zinc-400">
            Find answers to commonly asked questions about buying equipment.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = active === index;

            return (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <h3 className="text-base font-medium text-white md:text-lg">
                    {faq.question}
                  </h3>

                  <div className="text-[#F5A623]">
                    {isOpen ? <FiMinus size={20} /> : <FiPlus size={20} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-6 pb-6 leading-7 text-zinc-400">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
