"use client";

export default function RentalStatusBadge({ status }) {
  const styles = {
    Pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",

    Confirmed: "bg-blue-500/10 text-blue-400 border border-blue-500/20",

    "Picked Up": "bg-purple-500/10 text-purple-400 border border-purple-500/20",

    Returned: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",

    Completed: "bg-green-500/10 text-green-400 border border-green-500/20",

    Cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
