"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";

const faqs = [
  {
    question: "Do you cover weddings and events?",
    answer:
      "Yes, we provide professional photography and videography services for weddings, engagements, birthdays and corporate events.",
  },
  {
    question: "Do you provide photo albums?",
    answer:
      "Yes, we offer premium album design and printing services with customizable layouts and finishes.",
  },
  {
    question: "Can you create 3D invitation websites?",
    answer:
      "Absolutely. We design modern and interactive 3D invitation websites for weddings and special occasions.",
  },
  {
    question: "How long does photo and video editing take?",
    answer:
      "Delivery timelines vary by project size, but most editing work is completed within the agreed schedule.",
  },
];

export default function ServicesFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <span className="rounded-full border border-[#F5A623]/20 bg-[#F5A623]/10 px-4 py-2 text-sm font-medium text-[#F5A623]">
            FAQ
          </span>

          <h2 className="mt-5 font-heading text-3xl font-bold text-white md:text-5xl">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-zinc-400">
            Find answers to common questions about our services.
          </p>
        </div>

        {/* FAQ List */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
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
