"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { FaUserCircle, FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import ServiceStatusBadge from "./ServiceStatusBadge";

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

export default function ServiceModal({
  open,
  onClose,
  booking,
  onStatusChange,
  onDelete,
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(booking?.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!open || !booking) return null;

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      const response = await fetch(`/api/services/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error("Failed to save notes");
      const data = await response.json();
      if (data.success) {
        toast.success("Notes updated");
        setEditingNotes(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/services/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      const data = await response.json();
      if (data.success) {
        onStatusChange(booking.id, newStatus);
        toast.success("Status updated");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/services/${booking.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete booking");
      const data = await response.json();
      if (data.success) {
        toast.success("Booking deleted");
        if (onDelete) onDelete(booking.id);
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete booking");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const createdDate = new Date(booking.createdAt);
  const formattedCreatedDate = createdDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black shadow-2xl"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute right-6 top-6 z-10 flex items-center justify-center rounded-full bg-white/10 p-2 text-zinc-400 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
            >
              <X size={20} />
            </motion.button>

            <div className="grid gap-6 p-6 md:grid-cols-3 lg:p-8">
              {/* LEFT COLUMN - Avatar & Timeline */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-6"
              >
                {/* Avatar & Status */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#F5A623]/20 to-[#F5A623]/5 ring-2 ring-[#F5A623]/30">
                        <FaUserCircle className="h-16 w-16 text-[#F5A623]" />
                      </div>
                    </div>

                    <h3 className="text-center text-lg font-bold text-white">
                      {booking.fullName}
                    </h3>

                    <p className="mt-1 text-center text-sm text-zinc-500">
                      {booking.shootType}
                    </p>

                    <div className="mt-4">
                      <ServiceStatusBadge status={booking.status} />
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Booking Timeline
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-[#F5A623]" />
                        <div className="mt-2 h-8 w-0.5 bg-white/10" />
                      </div>

                      <div className="pb-4">
                        <p className="text-xs font-semibold text-zinc-400">
                          CREATED
                        </p>

                        <p className="mt-1 text-sm text-zinc-300">
                          {formattedCreatedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            booking.status !== "pending"
                              ? "bg-[#F5A623]"
                              : "bg-white/20"
                          }`}
                        />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-zinc-400">
                          BOOKING ID
                        </p>

                        <p className="mt-1 font-mono text-xs text-zinc-300">
                          {booking.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT COLUMN - Customer & Event Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="col-span-2 flex flex-col gap-6"
              >
                {/* Customer Information */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Customer Information
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400">
                        Full Name
                      </p>

                      <p className="mt-2 text-white">{booking.fullName}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-zinc-400">
                        Phone Number
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <p className="text-white">{booking.phone}</p>

                        <motion.a
                          whileHover={{ scale: 1.1 }}
                          href={`https://wa.me/${booking.phone.replace(
                            /\D/g,
                            "",
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-green-500/20 p-2 text-green-400 transition-all hover:bg-green-500/30"
                        >
                          <FaWhatsapp size={16} />
                        </motion.a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Information */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Event Information
                  </p>

                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <MessageSquare
                        size={16}
                        className="mt-1 text-[#F5A623]"
                      />

                      <div>
                        <p className="text-xs font-semibold text-zinc-400">
                          Shoot Type
                        </p>

                        <p className="mt-1 text-white">{booking.shootType}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="mt-1 text-[#F5A623]" />

                      <div>
                        <p className="text-xs font-semibold text-zinc-400">
                          Event Date
                        </p>

                        <p className="mt-1 text-white">{booking.eventDate}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="mt-1 text-[#F5A623]" />

                      <div>
                        <p className="text-xs font-semibold text-zinc-400">
                          Location
                        </p>

                        <p className="mt-1 text-white">{booking.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {booking.description && (
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                      Description
                    </p>

                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                      {booking.description}
                    </p>
                  </div>
                )}

                {/* Status Section */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Status Management
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">
                        Current Status
                      </span>

                      <ServiceStatusBadge status={booking.status} />
                    </div>

                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full rounded-xl border border-[#F5A623]/30 bg-black/40 px-4 py-2 text-white transition-all focus:border-[#F5A623] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20"
                    >
                      <option value="pending">Pending</option>

                      <option value="confirmed">Confirmed</option>

                      <option value="completed">Completed</option>

                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                      Admin Notes
                    </p>

                    {!editingNotes && (
                      <button
                        onClick={() => setEditingNotes(true)}
                        className="text-xs font-semibold text-[#F5A623] transition-all hover:text-[#F5A623]/80"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {editingNotes ? (
                    <div className="space-y-3">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this booking..."
                        className="w-full rounded-xl border border-[#F5A623]/30 bg-black/40 p-3 text-sm text-white placeholder-zinc-600 transition-all focus:border-[#F5A623] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20"
                        rows={3}
                      />

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="flex-1 rounded-xl bg-[#F5A623] px-4 py-2 font-semibold text-black transition-all disabled:opacity-50"
                        >
                          {savingNotes ? "Saving..." : "Save"}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setEditingNotes(false);
                            setNotes(booking.notes || "");
                          }}
                          className="flex-1 rounded-xl border border-white/10 px-4 py-2 font-semibold text-white transition-all hover:bg-white/5"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-300">
                      {booking.notes || "No notes added yet"}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* FOOTER - Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-between gap-3 border-t border-white/10 bg-black/30 p-6 backdrop-blur-sm"
            >
              <motion.button
                whileHover={!deleting ? { scale: 1.05 } : {}}
                whileTap={!deleting ? { scale: 0.95 } : {}}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 font-semibold text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete
              </motion.button>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-4 py-2 font-semibold text-white transition-all hover:bg-white/5"
                >
                  Close
                </motion.button>

                {booking.status !== "completed" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusChange("completed")}
                    className="flex items-center gap-2 rounded-xl bg-green-500/20 px-4 py-2 font-semibold text-green-400 transition-all hover:bg-green-500/30"
                  >
                    <CheckCircle size={16} />
                    Complete
                  </motion.button>
                )}

                {booking.status !== "confirmed" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusChange("confirmed")}
                    className="flex items-center gap-2 rounded-xl bg-[#F5A623]/20 px-4 py-2 font-semibold text-[#F5A623] transition-all hover:bg-[#F5A623]/30"
                  >
                    <CheckCircle size={16} />
                    Confirm
                  </motion.button>
                )}

                {booking.status !== "cancelled" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusChange("cancelled")}
                    className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 font-semibold text-red-400 transition-all hover:bg-red-500/30"
                  >
                    <XCircle size={16} />
                    Cancel
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-2xl border border-red-500/30 bg-black p-6"
                  >
                    <h3 className="text-lg font-bold text-white">
                      Delete Booking?
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      This action cannot be undone.
                    </p>

                    <div className="mt-6 flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 rounded-xl border border-white/10 px-4 py-2 font-semibold text-white transition-all hover:bg-white/5"
                      >
                        Cancel
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-red-500 px-4 py-2 font-semibold text-white transition-all disabled:opacity-50"
                      >
                        {deleting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
