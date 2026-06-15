"use client";

import { FaSearch } from "react-icons/fa";

export default function SearchBar({ searchTerm, setSearchTerm, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex w-full gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={searchTerm}
          placeholder="Search cameras, lenses, accessories..."
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-14 text-white placeholder:text-zinc-500 outline-none backdrop-blur-xl transition-all duration-300 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,166,35,0.15)]"
        />

        <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400" />
      </div>

      <button
        onClick={onSearch}
        className="cursor-pointer rounded-2xl bg-amber-500 px-6 py-4 font-semibold text-black transition-all duration-300 hover:bg-amber-400"
      >
        Search
      </button>
    </div>
  );
}
