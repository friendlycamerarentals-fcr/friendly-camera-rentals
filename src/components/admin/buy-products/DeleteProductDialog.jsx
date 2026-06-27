"use client";

import { Trash2, X } from "lucide-react";

export default function DeleteProductDialog({
  open,
  onClose,
  product,
  onConfirm,
}) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-500/10 p-3">
              <Trash2 size={22} className="text-red-400" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Delete Product
              </h2>

              <p className="text-sm text-zinc-500">
                This action cannot be undone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-zinc-400">
            Are you sure you want to delete:
          </p>

          <h3 className="mt-2 font-semibold text-white">{product.name}</h3>

          <p className="mt-1 text-sm text-zinc-500">
            {product.brand} {product.model}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 px-4 py-3 font-medium text-white transition hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-red-500 px-4 py-3 font-medium text-white transition hover:opacity-90"
          >
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
}
