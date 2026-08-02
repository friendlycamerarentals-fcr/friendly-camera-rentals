"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RewardPagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row">
      {/* Left */}
      <p className="text-sm text-zinc-400">
        Page <span className="font-semibold text-white">{currentPage}</span> of{" "}
        <span className="font-semibold text-white">{totalPages}</span>
      </p>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#111111] text-white transition hover:border-[#F5A623] hover:text-[#F5A623] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page Numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`h-10 min-w-[40px] rounded-xl px-3 text-sm font-semibold transition ${
              currentPage === page
                ? "bg-[#F5A623] text-black shadow-[0_10px_25px_rgba(245,166,35,0.35)]"
                : "border border-white/10 bg-[#111111] text-white hover:border-[#F5A623] hover:text-[#F5A623]"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#111111] text-white transition hover:border-[#F5A623] hover:text-[#F5A623] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
