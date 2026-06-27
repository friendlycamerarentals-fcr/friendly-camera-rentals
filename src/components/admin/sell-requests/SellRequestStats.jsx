export default function SellRequestStats({ requests = [] }) {
  const total = requests.length;

  const pending = requests.filter((item) => item.status === "pending").length;

  const approved = requests.filter((item) => item.status === "approved").length;

  const rejected = requests.filter((item) => item.status === "rejected").length;

  const contacted = requests.filter(
    (item) => item.status === "contacted",
  ).length;

  const stats = [
    {
      label: "Total Requests",
      value: total,
    },
    {
      label: "Pending",
      value: pending,
    },
    {
      label: "Contacted",
      value: contacted,
    },
    {
      label: "Approved",
      value: approved,
    },
    {
      label: "Rejected",
      value: rejected,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/10 bg-zinc-950 p-2"
        >
          <p className="text-sm text-zinc-500">{item.label}</p>

          <h3 className="mt-2 text-3xl pl-2 font-bold text-white">{item.value}</h3>
        </div>
      ))}
    </div>
  );
}
