"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { useFetchData, performCRUDOperation } from "@/hooks/useFetchData";
import TestimonialStats from "@/components/admin/testimonials/TestimonialStats";
import TestimonialCard from "@/components/admin/testimonials/TestimonialCard";
import TestimonialModal from "@/components/admin/testimonials/TestimonialModal";
import FilterTabs from "@/components/admin/testimonials/FilterTabs";
import DateFilters from "@/components/admin/testimonials/DateFilters";

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-white/10 bg-zinc-950/50 p-6 space-y-4">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="h-16 w-16 rounded-full bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800 rounded w-1/2" />
          <div className="h-3 bg-zinc-800 rounded w-1/3" />
          <div className="h-3 bg-zinc-800 rounded w-1/4" />
        </div>
      </div>
      <div className="h-6 w-16 bg-zinc-800 rounded-full" />
    </div>
    <div className="h-px bg-white/10" />
    <div className="space-y-2">
      <div className="h-3 bg-zinc-800 rounded" />
      <div className="h-3 bg-zinc-800 rounded w-5/6" />
    </div>
  </div>
);

const getDateRangeFilter = (dateFilter) => {
  const now = new Date();
  let startDate = new Date(0); // epoch for "all-time"

  switch (dateFilter) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "last-7-days":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "last-30-days":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      break;
  }

  return startDate;
};

export default function TestimonialsPage() {
  // Use custom hook for data fetching and refetching
  const {
    data: testimonials,
    loading,
    refetch,
    setData,
  } = useFetchData("/api/testimonials");

  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all-time");

  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredTestimonials = useMemo(() => {
    let result = testimonials;

    // Status filter
    if (filter !== "all") {
      result = result.filter((item) => item.status === filter);
    }

    // Date filter
    const startDate = getDateRangeFilter(dateFilter);
    result = result.filter((item) => new Date(item.createdAt) >= startDate);

    return result;
  }, [filter, testimonials, dateFilter]);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: "approved",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to approve testimonial");
      }

      // Optimistic update
      setData((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "approved",
              }
            : item,
        ),
      );

      toast.success("✅ Testimonial approved");

      await refetch(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to approve testimonial");
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: "rejected",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to reject testimonial");
      }

      // Optimistic update
      setData((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "rejected",
              }
            : item,
        ),
      );

      toast.success("❌ Testimonial rejected");

      await refetch(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to reject testimonial");
    }
  };

  const handleDeleteClick = (testimonial) => {
    setDeleteConfirm(testimonial);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/testimonials/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete testimonial");
      }

      // Optimistic update
      setData((prev) => prev.filter((item) => item.id !== deleteConfirm.id));
      toast.success("🗑️ Testimonial deleted successfully");
      setDeleteConfirm(null);

      await refetch(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete testimonial");
    } finally {
      setDeleting(false);
    }
  };

  const handleModalDelete = async (id) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete testimonial");
      }

      // Optimistic update
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success("🗑️ Testimonial deleted successfully");

      await refetch(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete testimonial");
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = (id) => {
    const testimonial = testimonials.find((t) => t.id === id);
    if (testimonial) {
      handleDeleteClick(testimonial);
    }
  };

  const handleView = (testimonial) => {
    setSelectedTestimonial(testimonial);

    setModalOpen(true);
  };

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Testimonials
          </h1>

          <p className="mt-3 text-lg text-zinc-400">
            Manage customer reviews and approvals
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <TestimonialStats testimonials={testimonials} />
      </motion.div>

      {/* Filters Section */}
      <motion.div variants={itemVariants} className="grid gap-8 lg:grid-cols-2">
        {/* Status Filters */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Status
          </label>
          <FilterTabs
            testimonials={testimonials}
            activeFilter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {/* Date Filters */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Date Range
          </label>
          <DateFilters
            activeDateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
          />
        </div>
      </motion.div>

      {/* Results */}
      {loading ? (
        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2"
        >
          {[1, 2, 3, 4].map((index) => (
            <SkeletonCard key={index} />
          ))}
        </motion.div>
      ) : filteredTestimonials.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-16 text-center backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5A623]/20"
          >
            <span className="text-4xl">📭</span>
          </motion.div>

          <h3 className="text-2xl font-bold text-white">
            No Testimonials Found
          </h3>

          <p className="mt-3 text-zinc-400">
            {filter !== "all" || dateFilter !== "all-time"
              ? "Try adjusting your filters"
              : "Customer reviews will appear here"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2"
        >
          <AnimatePresence mode="wait">
            {filteredTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal */}
      <TestimonialModal
        open={modalOpen}
        testimonial={selectedTestimonial}
        onClose={() => {
          setModalOpen(false);

          setSelectedTestimonial(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleModalDelete}
      />

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 backdrop-blur-xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <span className="text-2xl">⚠️</span>
              </div>

              <h3 className="text-2xl font-bold text-white">
                Delete Testimonial?
              </h3>

              <p className="mt-3 text-zinc-400">
                This action cannot be undone. The testimonial from{" "}
                <span className="font-semibold text-white">
                  {deleteConfirm.name}
                </span>{" "}
                will be permanently deleted.
              </p>

              <div className="mt-8 flex gap-3">
                <motion.button
                  whileHover={!deleting ? { scale: 1.05 } : {}}
                  whileTap={!deleting ? { scale: 0.95 } : {}}
                  onClick={() => !deleting && setDeleteConfirm(null)}
                  disabled={deleting}
                  className={`flex-1 rounded-xl border border-white/10 px-4 py-3 font-semibold text-white transition-all duration-300 ${
                    deleting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-white/30 hover:bg-white/5 cursor-pointer"
                  }`}
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={!deleting ? { scale: 1.05 } : {}}
                  whileTap={!deleting ? { scale: 0.95 } : {}}
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className={`flex-1 rounded-xl bg-red-500/10 px-4 py-3 font-semibold text-red-400 border border-red-500/20 transition-all duration-300 ${
                    deleting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-red-500/20 hover:border-red-500/40 cursor-pointer"
                  }`}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
