"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Loader2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "sonner";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export default function TestimonialModal({
  open,
  onClose,
  testimonial: initialTestimonial,
  onApprove,
  onReject,
  onDelete,
}) {
  const [loading, setLoading] = useState(false);
  const [testimonial, setTestimonial] = useState(initialTestimonial);

  // Sync internal state when initialTestimonial changes
  useEffect(() => {
    if (initialTestimonial) {
      setTestimonial(initialTestimonial);
    }
  }, [initialTestimonial?.id, open]);

  if (!testimonial) return null;

  const handleApproveClick = async () => {
    if (testimonial.status === "approved") {
      toast.info("Already approved");
      return;
    }

    setLoading(true);
    try {
      await onApprove(testimonial.id);
      setTestimonial((prev) => ({
        ...prev,
        status: "approved",
      }));
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = async () => {
    if (testimonial.status === "rejected") {
      toast.info("Already rejected");
      return;
    }

    setLoading(true);
    try {
      await onReject(testimonial.id);
      setTestimonial((prev) => ({
        ...prev,
        status: "rejected",
      }));
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    setLoading(true);
    try {
      await onDelete(testimonial.id);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 overflow-hidden"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute top-6 right-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={24} />
            </motion.button>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
                className="flex-shrink-0"
              >
                {testimonial.image ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-gray-200">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-300">
                    <FaUserCircle className="h-16 w-16 text-gray-500" />
                  </div>
                )}
              </motion.div>

              {/* Name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-gray-900">
                  {testimonial.name}
                </h2>
              </motion.div>

              {/* Designation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <p className="text-lg text-gray-500">
                  {testimonial.designation || "Customer"}
                </p>
              </motion.div>

              {/* Rating */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-2 justify-center"
              >
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={24}
                    className={`${
                      index < (testimonial.rating || 5)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </motion.div>

              {/* Review Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <p className="text-gray-600 text-lg leading-relaxed">
                  "{testimonial.review}"
                </p>
              </motion.div>

              {/* Date & Time */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-sm text-gray-500">
                  Submitted on{" "}
                  {new Date(testimonial.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(testimonial.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="w-full flex flex-col gap-3 pt-4"
              >
                {/* Approve Button */}
                <motion.button
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  onClick={handleApproveClick}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Approve Testimonial
                    </>
                  )}
                </motion.button>

                {/* Reject Button */}
                <motion.button
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  onClick={handleRejectClick}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <XCircle size={20} />
                      Reject Testimonial
                    </>
                  )}
                </motion.button>

                {/* Delete Button */}
                <motion.button
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  onClick={handleDeleteClick}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-500 text-red-500 hover:bg-red-50 font-semibold py-3 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={20} />
                      Delete
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
