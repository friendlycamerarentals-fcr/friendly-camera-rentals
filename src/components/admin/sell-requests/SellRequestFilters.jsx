export default function SellRequestFilters({
  search,
  setSearch,
  status,
  setStatus,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Search customer, brand, model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
        >
          <option value="all">All Status</option>

          <option value="pending">Pending</option>

          <option value="contacted">Contacted</option>

          <option value="approved">Approved</option>

          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>
  );
}
