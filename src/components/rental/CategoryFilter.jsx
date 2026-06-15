"use client";

export default function CategoryFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`cursor-pointer rounded-full px-6 py-3 text-sm font-semibold capitalize transition-all duration-300 hover:scale-105 ${
            selectedCategory === category
              ? "bg-amber-500 text-black shadow-[0_0_25px_rgba(245,166,35,0.35)]"
              : "border border-white/10 bg-white/5 text-zinc-300 hover:border-amber-500/40 hover:text-white"
          }`}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
      ))}
    </div>
  );
}
