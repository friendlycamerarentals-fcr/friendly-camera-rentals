"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import SortableProductRow from "./SortableProductRow";
import { motion } from "framer-motion";

export default function ReorderProductsModal({
  open,
  onClose,
  products,
  productType, // "buy" or "rental"
  onSave,
  loading,
}) {
  const [items, setItems] = useState(products || []);

  useEffect(() => {
    if (open) {
      setItems(products || []);
    }
  }, [open, products]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = itemIds.indexOf(active.id);
    const newIndex = itemIds.indexOf(over.id);

    const newOrder = arrayMove(items, oldIndex, newIndex);
    setItems(newOrder);
  };

  const handleSave = async () => {
    try {
      // Create order update with new display_order values
      const productOrder = items.map((item, index) => ({
        id: item.id,
        display_order: index,
      }));

      const endpoint =
        productType === "buy"
          ? "/api/buy-products/reorder"
          : "/api/rental-products/reorder";

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productOrder }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Products reordered successfully");
        await onSave?.();
        onClose?.();
      } else {
        toast.error(result.message || "Failed to save order");
      }
    } catch (error) {
      console.error("Failed to save order:", error);
      toast.error("Failed to save order");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end overflow-y-auto bg-black/60 sm:items-center sm:justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-zinc-950 border border-white/10 p-6 sm:max-w-2xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Reorder Products</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Drag to reorder products. First position will be displayed first.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Products List */}
        <div className="mb-6 space-y-2 max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 py-8 text-center text-zinc-500">
              No products to reorder
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                {items.map((product, index) => (
                  <SortableProductRow
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-white/10 pt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-2xl border border-white/10 bg-transparent px-4 py-3 font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-2xl bg-[#F5A623] px-4 py-3 font-medium text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Order"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
