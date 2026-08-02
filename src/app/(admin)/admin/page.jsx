import {
  Camera,
  ShoppingBag,
  IndianRupee,
  CalendarDays,
  Star,
  Users,
} from "lucide-react";

import { query } from "@/db/query";
import StatsCard from "@/components/admin/StatsCard";

export const revalidate = 0;

async function getCount(tableName) {
  const rows = await query(`SELECT COUNT(*)::int AS count FROM "${tableName}"`);
  return Number(rows[0]?.count ?? 0);
}

export default async function AdminDashboard() {
  const [
    rentalsCount,
    buyProductsCount,
    sellRequestsCount,
    bookingsCount,
    testimonialsCount,
    customersCount,
  ] = await Promise.all([
    getCount("RentalProduct"),
    getCount("BuyProduct"),
    getCount("SellRequest"),
    getCount("ServiceBooking"),
    getCount("Testimonial"),
    getCount("Customer"),
  ]);

  const stats = [
    {
      title: "Rentals",
      value: String(rentalsCount),
      icon: Camera,
      color: "#F5A623",
      change: "Active Products",
    },
    {
      title: "Buy Products",
      value: String(buyProductsCount),
      icon: ShoppingBag,
      color: "#3B82F6",
      change: "Available Items",
    },
    {
      title: "Sell Requests",
      value: String(sellRequestsCount),
      icon: IndianRupee,
      color: "#22C55E",
      change: "Total Enquiries",
    },
    {
      title: "Bookings",
      value: String(bookingsCount),
      icon: CalendarDays,
      color: "#A855F7",
      change: "Total Bookings",
    },
    {
      title: "Testimonials",
      value: String(testimonialsCount),
      icon: Star,
      color: "#F59E0B",
      change: "Total Reviews",
    },
    {
      title: "Customers",
      value: String(customersCount),
      icon: Users,
      color: "#EF4444",
      change: "Registered",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>

        <p className="mt-2 text-zinc-400">
          Welcome to Friendly Camera Rentals Admin Panel
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
            change={item.change}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-white">Recent Activity</h2>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-white/5 p-4 text-zinc-300">
            📸 New rental booking received
          </div>

          <div className="rounded-2xl bg-white/5 p-4 text-zinc-300">
            ⭐ New testimonial awaiting approval
          </div>

          <div className="rounded-2xl bg-white/5 p-4 text-zinc-300">
            💰 New sell request submitted
          </div>

          <div className="rounded-2xl bg-white/5 p-4 text-zinc-300">
            🛍️ Product marked as sold
          </div>
        </div>
      </div>
    </div>
  );
}
