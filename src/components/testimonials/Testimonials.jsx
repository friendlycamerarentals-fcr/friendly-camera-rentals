"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";

import TestimonialForm from "./TestimonialForm";

export default function Testimonials({ testimonials = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  // Detect screen size and set cards per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto slide
  useEffect(() => {
    if (testimonials.length <= cardsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + cardsPerView;
        return next >= testimonials.length ? 0 : next;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [testimonials.length, cardsPerView]);

  const visibleTestimonials = useMemo(() => {
    if (testimonials.length <= cardsPerView) return testimonials;

    return testimonials.slice(currentIndex, currentIndex + cardsPerView);
  }, [testimonials, currentIndex, cardsPerView]);

  const totalPages = Math.ceil(testimonials.length / cardsPerView);

  return (
    <section className="bg-black py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F5A623]">
            REAL STORIES
          </span>

          <h2 className="mt-4 font-heading text-4xl text-white md:text-6xl">
            What Our Customers Say
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            Trusted by photographers, filmmakers, and creators across India.
          </p>
        </motion.div>

        {/* Empty State */}
        {testimonials.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
            <p className="text-2xl font-semibold text-white">
              No customer reviews available yet.
            </p>

            <p className="mt-3 text-zinc-400">
              Be the first customer to share your experience.
            </p>
          </div>
        ) : (
          <>
            {/* Cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -25 }}
                transition={{ duration: 0.5 }}
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {visibleTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id || `${testimonial.name}-${index}`}
                    whileHover={{ y: -8 }}
                    className="
                      group
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.03]
                      p-8
                      backdrop-blur-xl
                      transition-all
                      duration-500
                      hover:border-[#F5A623]/40
                      hover:shadow-[0_0_50px_rgba(245,166,35,0.15)] cursor-pointer
                    "
                  >
                    {/* Quote */}
                    <Quote className="mb-6 h-8 w-8 text-[#F5A623]/40" />

                    {/* Review */}
                    <p className="mb-4 min-h-[140px] leading-8 text-zinc-300">
                      "{testimonial.review || testimonial.text}"
                    </p>

                    {/* User */}
                    <div className="flex items-center gap-4">
                      <FaUserCircle className="h-10 w-10 text-zinc-500" />

                      <div>
                        <h4 className="font-semibold text-white">
                          {testimonial.name}
                        </h4>

                        <p className="text-sm text-zinc-400">
                          {testimonial.designation ||
                            testimonial.role ||
                            "FCR Customer"}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mt-5 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < (testimonial.rating || 5)
                              ? "fill-[#F5A623] text-[#F5A623]"
                              : "text-zinc-600"
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            {testimonials.length > cardsPerView && (
              <div className="mt-10 flex justify-center gap-3">
                {Array.from({
                  length: totalPages,
                }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index * cardsPerView)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      Math.floor(currentIndex / cardsPerView) === index
                        ? "w-10 bg-[#F5A623]"
                        : "w-2.5 bg-zinc-700 hover:bg-zinc-500"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Review Form */}
        <TestimonialForm />
      </div>
    </section>
  );
}
