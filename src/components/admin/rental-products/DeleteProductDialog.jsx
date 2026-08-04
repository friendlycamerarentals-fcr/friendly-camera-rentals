"use client";

import { AlertTriangle, X } from "lucide-react";

export default function DeleteProductDialog({
  open,
  onClose,
  onConfirm,
  product,
  loading = false,
}) {
  if (!open || !product) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <AlertTriangle size={26} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Delete Product
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                This action cannot be undone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-zinc-300">
            Are you sure you want to delete
          </p>

          <h3 className="mt-2 font-semibold text-white">{product.name}</h3>

          <p className="mt-1 text-sm text-zinc-500">Brand: {product.brand}</p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full cursor-pointer rounded-2xl border border-white/10 px-5 py-3 text-white transition hover:bg-white/5 sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full cursor-pointer rounded-2xl bg-red-500 px-5 py-3 font-medium text-white transition hover:bg-red-600 disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Deleting..." : "Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
