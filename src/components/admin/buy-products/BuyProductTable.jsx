"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";

export default function BuyProductTable({
  products = [],
  onView,
  onDelete,
  onStatusChange,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 bg-black/40">
            <tr className="text-left text-zinc-400">
              <th className="w-[80px] px-4 py-4 text-center">S.No</th>
              <th className="px-4 py-4">Product</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Brand</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-white/5 transition hover:bg-white/3"
              >
                <td className="w-[80px] px-4 py-4 text-center">
                  <span className="inline-flex min-w-[44px] items-center justify-center rounded-full px-2 py-1 text-sm font-semibold text-[#F5A623]">
                    #{product.display_order + 1}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full rounded-xl bg-white/5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white">
                        {product.name}
                      </h3>
                      <p className="truncate text-xs text-zinc-500">
                        {product.model || product.brand}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 capitalize text-zinc-300">
                  {product.category}
                </td>

                <td className="px-4 py-4 text-zinc-300">{product.brand}</td>

                <td className="px-4 py-4">
                  <select
                    className="w-35 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-[#F5A623]"
                    value={product.status || "In Stock"}
                    onChange={(e) =>
                      onStatusChange?.(product.id, e.target.value)
                    }
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Sold">Sold</option>
                  </select>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(product)}
                      className="rounded-xl border border-white/10 p-2 text-white transition hover:bg-white/10"
                    >
                      <Eye size={16} />
                    </button>

                    <Link
                      href={`/admin/buy-products/edit/${product.id}`}
                      className="rounded-xl border border-white/10 p-2 text-blue-400 transition hover:bg-blue-500/10"
                    >
                      <Pencil size={16} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      className="rounded-xl border border-white/10 p-2 text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="py-20 text-center text-zinc-500">
            No buy products found.
          </div>
        )}
      </div>
    </div>
  );
}
