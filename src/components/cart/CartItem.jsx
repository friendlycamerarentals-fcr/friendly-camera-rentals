"use client";

import Image from "next/image";
import { FaTrash } from "react-icons/fa";

export default function CartItem({
  item,
  onRemove,
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-xl">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="flex-1">
        <h3 className="line-clamp-2 font-semibold text-white">
          {item.name}
        </h3>

        <p className="mt-1 text-sm text-zinc-400">
          Duration: {item.duration}
        </p>

        <p className="mt-2 font-bold text-amber-400">
          ₹{item.price}
        </p>
      </div>

      <button
        onClick={onRemove}
        className="self-start text-red-400 transition hover:text-red-500 cursor-pointer"
      >
        <FaTrash size={16} />
      </button>
    </div>
  );
}