"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export default function SortableProductRow({ product, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 rounded-xl border transition ${
        isDragging
          ? "border-[#F5A623] bg-[#F5A623]/10 shadow-lg"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      } p-4`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={18} />
      </button>

      {/* Position Badge */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-xs font-semibold text-white">
        {index + 1}
      </div>

      {/* Thumbnail */}
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="h-16 w-16 rounded-lg object-cover"
        />
      )}

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{product.name}</h3>
        <div className="mt-1 flex gap-3 text-xs text-zinc-500">
          <span className="truncate">{product.category}</span>
          <span>•</span>
          <span className="truncate">{product.brand}</span>
        </div>
      </div>
    </div>
  );
}
