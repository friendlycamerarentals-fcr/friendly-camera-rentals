"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

const StarRating = ({ value, onChange }) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="cursor-pointer transition-transform duration-300 hover:scale-110"
        >
          <Star
            className={`h-8 w-8 transition-all duration-300 ${
              star <= value
                ? "fill-[#F5A623] text-[#F5A623]"
                : "text-zinc-600 hover:text-[#F5A623]/50"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function TestimonialForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    text: "",
    rating: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.rating) {
      toast.error("Please select a rating");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!form.text.trim()) {
      toast.error("Please write your review");
      return;
    }

    if (form.text.trim().length < 20) {
      toast.error("Review should be at least 20 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          designation: form.role,
          review: form.text,
          rating: form.rating,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to submit review");
      }

      setSubmitted(true);

      setForm({
        name: "",
        role: "",
        text: "",
        rating: 0,
      });

      toast.success("Review submitted successfully. It will be visible after moderation.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Button
  if (!isOpen && !submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <p className="mb-5 text-lg text-zinc-400">
          Rented from Friendly Camera Rentals? Share your experience with the
          community.
        </p>

        <button
          onClick={() => {
            setSubmitted(false);
            setIsOpen(true);
          }}
          className="cursor-pointer rounded-full border border-[#F5A623]/30 px-8 py-4 font-semibold text-[#F5A623] transition-all duration-300 hover:bg-[#F5A623] hover:text-black hover:shadow-[0_0_40px_rgba(245,166,35,0.3)]"
        >
          ⭐ Write a Review
        </button>
      </motion.div>
    );
  }

  // Success Screen
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto mt-14 max-w-xl rounded-[32px] border border-[#F5A623]/20 bg-white/[0.03] p-10 text-center backdrop-blur-xl"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F5A623]/10">
          <CheckCircle className="h-10 w-10 text-[#F5A623]" />
        </div>

        <h3 className="mt-6 text-3xl font-semibold text-white">Thank You!</h3>

        <p className="mt-3 leading-7 text-zinc-400">
          Your review has been submitted successfully and will appear after
          moderation.
        </p>

        <button
          onClick={() => {
            setSubmitted(false);
            setIsOpen(false);
          }} 
          className="mt-6 cursor-pointer rounded-full border border-[#F5A623]/30 px-6 py-3 text-[#F5A623] transition hover:bg-[#F5A623] hover:text-black"
        >
          Close
        </button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="mx-auto mt-14 max-w-3xl rounded-[36px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl md:p-10"
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h3 className="font-heading text-3xl text-white">
            Share Your Experience
          </h3>

          <button
            onClick={() => setIsOpen(false)}
            className="cursor-pointer rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="mb-3 block text-zinc-300">Your Rating *</label>

            <StarRating
              value={form.rating}
              onChange={(rating) =>
                setForm((prev) => ({
                  ...prev,
                  rating,
                }))
              }
            />
          </div>

          {/* Name */}
          <div>
            <label className="mb-3 block text-zinc-300">Your Name *</label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Your Name"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-white outline-none transition focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-3 block text-zinc-300">
              Profession (Optional)
            </label>

            <input
              type="text"
              value={form.role}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  role: e.target.value,
                }))
              }
              placeholder="Photographer, Filmmaker..."
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-white outline-none transition focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
            />
          </div>

          {/* Review */}
          <div>
            <label className="mb-3 block text-zinc-300">
              Your Review *
              <span className="ml-2 text-sm text-zinc-500">
                ({form.text.length}/300)
              </span>
            </label>

            <textarea
              rows={5}
              value={form.text}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  text: e.target.value.slice(0, 300),
                }))
              }
              placeholder="Tell us about your experience with Friendly Camera Rentals..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-6 text-white outline-none transition focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#F5A623] py-5 font-semibold text-black transition-all duration-300 hover:scale-[1.01] hover:bg-amber-400 hover:shadow-[0_0_50px_rgba(245,166,35,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Review
              </>
            )}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Reviews are published after a quick moderation check.
          </p>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
