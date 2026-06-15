"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";

const faqs = [
  {
    question: "How long does it take to get a response?",
    answer:
      "Our team usually reviews your request and responds within 24 hours.",
  },
  {
    question: "Do I need the original invoice?",
    answer:
      "The original invoice is preferred but not mandatory. It helps improve buyer confidence.",
  },
  {
    question: "How do I receive payment?",
    answer:
      "Payments are made securely via UPI or bank transfer after final verification.",
  },
  {
    question: "Can I sell damaged equipment?",
    answer:
      "Yes. Equipment requiring repair can also be submitted for evaluation.",
  },
  {
    question: "Do you provide pickup service?",
    answer:
      "Pickup availability depends on your location. Our team will discuss logistics after review.",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="border-t border-white/10 bg-black py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-[#F5A623]">
            Frequently Asked Questions
          </span>

          <h2 className="mt-4 font-heading text-3xl font-bold md:text-5xl">
            Everything You Need To Know
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Find answers to common questions about selling your camera equipment
            through Friendly Camera Rentals.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="mt-14 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <motion.div
                key={faq.question}
                layout
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-lg font-semibold text-white">
                    {faq.question}
                  </span>

                  <div className="text-[#F5A623]">
                    {isOpen ? <FiMinus size={22} /> : <FiPlus size={22} />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                    >
                      <div className="border-t border-white/10 px-6 py-5">
                        <p className="leading-7 text-zinc-400">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
