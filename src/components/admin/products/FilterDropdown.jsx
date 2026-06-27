"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function FilterDropdown({
  value,
  onChange,
  options,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-white/10 bg-zinc-950 px-4 text-sm text-white transition hover:border-[#F5A623]/40"
      >
        <span>
          {options.find((item) => item.value === value)?.label || placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
          {options.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-white/5 ${
                  value === item.value
                    ? "bg-[#F5A623]/10 text-[#F5A623]"
                    : "text-zinc-300"
                }`}
              >
                {Icon && <Icon size={16} />}
                <span>{item.label}</span>
                {value === item.value && <span className="ml-auto">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
