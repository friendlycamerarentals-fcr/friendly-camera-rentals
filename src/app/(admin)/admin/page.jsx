import {
  Camera,
  ShoppingBag,
  IndianRupee,
  CalendarDays,
  Star,
  Users,
  Gift,
} from "lucide-react";

import { query } from "@/db/query";
import StatsCard from "@/components/admin/StatsCard";
import RecentActivity from "@/components/admin/RecentActivity";

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
    rewardsCount,
  ] = await Promise.all([
    getCount("RentalProduct"),
    getCount("BuyProduct"),
    getCount("SellRequest"),
    getCount("RentalRequest"),
    getCount("Testimonial"),
    getCount("Customer"),
    getCount("Reward"),
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
    {
      title: "Rewards",
      value: String(rewardsCount),
      icon: Gift,
      color: "#F5A623",
      change: "Rewards Generated",
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
      <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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

      <RecentActivity />
    </div>
  );
}
