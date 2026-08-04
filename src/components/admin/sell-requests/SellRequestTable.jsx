"use client";

import Link from "next/link";
import Image from "next/image";

import SellRequestStatusBadge from "./SellRequestStatusBadge";

export default function SellRequestTable({ requests = [], onView, onDelete }) {
  if (!requests.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950 py-20 text-center">
        <p className="text-zinc-500">No sell requests found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-zinc-500">
                Product
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-zinc-500">
                Customer
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-zinc-500">
                Category
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-zinc-500">
                Condition
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-zinc-500">
                Expected Price
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-zinc-500">
                Status
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium uppercase text-zinc-500">
                Date
              </th>

              <th className="px-6 py-4 text-right text-xs font-medium uppercase text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-white/5">
                {/* Product */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/10">
                      {request.images?.[0] ? (
                        <Image
                          src={request.images[0]}
                          alt={request.brand}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-black text-zinc-600">
                          No Img
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-white">{request.brand}</p>

                      <p className="text-sm text-zinc-500">{request.model}</p>
                    </div>
                  </div>
                </td>

                {/* Customer */}
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{request.fullName}</p>

                  <p className="text-sm text-zinc-500">{request.mobile}</p>
                </td>

                {/* Category */}
                <td className="px-6 py-4 text-zinc-300">{request.category}</td>

                {/* Condition */}
                <td className="px-6 py-4 text-zinc-300">{request.condition}</td>

                {/* Price */}
                <td className="px-6 py-4 font-medium text-[#F5A623]">
                  ₹{Number(request.expectedPrice || 0).toLocaleString()}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <SellRequestStatusBadge status={request.status} />
                </td>

                {/* Date */}
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onView(request)}
                      className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400"
                    >
                      View
                    </button>

                    <button
                      onClick={() => onDelete(request)}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
