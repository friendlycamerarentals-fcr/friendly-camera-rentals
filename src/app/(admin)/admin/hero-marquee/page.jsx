"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useFetchData } from "@/hooks/useFetchData";

const emptyForm = {
  text: "",
  isActive: true,
  display_order: 0,
};

export default function HeroMarqueePage() {
  const {
    data: marqueeItems,
    loading,
    refetch,
    setData,
  } = useFetchData("/api/hero-marquee");
  const { data: settingsData, refetch: refetchSettings } = useFetchData(
    "/api/hero-marquee/settings",
    {
      initialData: { isEnabled: true },
    },
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  const isMarqueeEnabled = settingsData?.isEnabled !== false;

  const sortedItems = useMemo(() => {
    return [...(marqueeItems || [])].sort((a, b) => {
      const orderDiff = (a.display_order || 0) - (b.display_order || 0);
      if (orderDiff !== 0) return orderDiff;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
  }, [marqueeItems]);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      text: item.text || "",
      isActive: item.isActive !== false,
      display_order: item.display_order || 0,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const normalizeText = (value) => {
    return value.replace(/\s+/g, " ").trim();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const text = normalizeText(form.text);

    if (!text) {
      toast.error("Marquee text is required");
      return;
    }

    if (text.length > 150) {
      toast.error("Marquee text must be 150 characters or fewer");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        editingItem
          ? `/api/hero-marquee/${editingItem.id}`
          : "/api/hero-marquee",
        {
          method: editingItem ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            isActive: form.isActive,
            display_order: Number(form.display_order) || 0,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save marquee item");
      }

      toast.success(editingItem ? "Marquee updated" : "Marquee created");
      await refetch(false);
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save marquee item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this marquee item?")) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/hero-marquee/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete marquee item");
      }

      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success("Marquee deleted");
      await refetch(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete marquee item");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisibility = async () => {
    setTogglingVisibility(true);

    try {
      const response = await fetch("/api/hero-marquee/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isEnabled: !isMarqueeEnabled }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update marquee visibility");
      }

      toast.success(
        isMarqueeEnabled
          ? "Marquee hidden on homepage"
          : "Marquee enabled on homepage",
      );
      await Promise.all([refetchSettings(false), refetch(false)]);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update marquee visibility");
    } finally {
      setTogglingVisibility(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Hero Marquee</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Manage the rotating hero banner messages shown on the homepage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggleVisibility}
            disabled={togglingVisibility}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 font-semibold transition ${
              isMarqueeEnabled
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-700 bg-zinc-900/80 text-zinc-300"
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {isMarqueeEnabled ? (
              <ToggleRight size={18} />
            ) : (
              <ToggleLeft size={18} />
            )}
            {isMarqueeEnabled ? "Visible on homepage" : "Hidden on homepage"}
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#F5A623] px-4 py-3 font-semibold text-black transition hover:bg-[#f6b53d]"
          >
            <Plus size={18} />
            Add Marquee
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-zinc-300">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Text</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created Date</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-zinc-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-zinc-500"
                  >
                    No marquee items found.
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-white/10 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">{item.display_order ?? 0}</td>
                    <td className="px-5 py-4 max-w-[320px]">{item.text}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${item.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-400"}`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded-xl border border-white/10 p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-xl border border-red-500/20 p-2 text-red-400 transition hover:bg-red-500/10"
                          disabled={deletingId === item.id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {editingItem ? "Edit Marquee" : "Add Marquee"}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Keep messages short, clear, and promotional.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Marquee Text
                  </label>
                  <textarea
                    value={form.text}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, text: event.target.value }))
                    }
                    rows={4}
                    maxLength={150}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#F5A623]"
                    placeholder="Enter marquee text"
                  />
                  <p className="mt-2 text-xs text-zinc-500">
                    Maximum 150 characters. Extra spaces are cleaned
                    automatically.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Status
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            isActive: !prev.isActive,
                          }))
                        }
                        className="flex items-center gap-2 text-sm text-zinc-300"
                      >
                        {form.isActive ? (
                          <ToggleRight className="text-emerald-400" size={20} />
                        ) : (
                          <ToggleLeft className="text-zinc-500" size={20} />
                        )}
                        {form.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.display_order}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          display_order: Number(event.target.value),
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#F5A623]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-2xl border border-white/10 px-4 py-3 text-zinc-300 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-2xl bg-[#F5A623] px-4 py-3 font-semibold text-black transition hover:bg-[#f6b53d] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
