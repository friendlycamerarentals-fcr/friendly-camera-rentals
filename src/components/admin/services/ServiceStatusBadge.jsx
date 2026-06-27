"use client";

export default function ServiceStatusBadge({ status = "new" }) {
  const variants = {
    new: {
      label: "New",
      className: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    },

    contacted: {
      label: "Contacted",
      className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    },

    confirmed: {
      label: "Confirmed",
      className: "border-green-500/20 bg-green-500/10 text-green-400",
    },

    completed: {
      label: "Completed",
      className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },

    cancelled: {
      label: "Cancelled",
      className: "border-red-500/20 bg-red-500/10 text-red-400",
    },
  };

  const current = variants[status] || variants.new;

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}
