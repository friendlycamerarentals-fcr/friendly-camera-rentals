export default function SellRequestStatusBadge({ status }) {
  const variants = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",

    contacted: "bg-blue-500/10 text-blue-400 border-blue-500/20",

    approved: "bg-green-500/10 text-green-400 border-green-500/20",

    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
        variants[status] || variants.pending
      }`}
    >
      {status}
    </span>
  );
}
