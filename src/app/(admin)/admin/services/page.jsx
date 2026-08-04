"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, Filter, X } from "lucide-react";

import { useFetchData } from "@/hooks/useFetchData";
import ServiceStats from "@/components/admin/services/ServiceStats";
import ServiceCard from "@/components/admin/services/ServiceCard";
import ServiceModal from "@/components/admin/services/ServiceModal";

export default function ServicesPage() {
  // Use custom hook for data fetching and refetching
  const {
    data: bookings,
    loading,
    refetch,
    setData,
  } = useFetchData("/api/services");

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Filter logic
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Search filter (name, phone, shoot type, location)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.fullName.toLowerCase().includes(query) ||
          booking.phone.includes(query) ||
          booking.shootType.toLowerCase().includes(query) ||
          booking.location.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();

      filtered = filtered.filter((booking) => {
        const createdDate = new Date(booking.createdAt);
        const daysDiff = Math.floor(
          (now - createdDate) / (1000 * 60 * 60 * 24),
        );

        switch (dateFilter) {
          case "today":
            return daysDiff === 0;
          case "week":
            return daysDiff <= 7;
          case "month":
            return daysDiff <= 30;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [bookings, searchQuery, statusFilter, dateFilter]);

  const handleView = (booking) => {
    setSelectedBooking(booking);

    setModalOpen(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Optimistic update
        setData((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                }
              : item,
          ),
        );

        setSelectedBooking((prev) =>
          prev
            ? {
                ...prev,
                status,
              }
            : null,
        );

        toast.success("Service booking status updated.");

        await refetch(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update service status.");
    }
  };

  const handleDelete = async (id) => {
    // Optimistic update
    setData((prev) => prev.filter((item) => item.id !== id));
    toast.success("Service booking deleted.");

    await refetch(false);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-zinc-400">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Service Bookings</h1>

        <p className="mt-2 text-zinc-500">
          Manage customer photography booking requests.
        </p>
      </div>

      {/* Stats */}
      <ServiceStats bookings={bookings} />

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              placeholder="Search by name, phone, type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 pl-11 pr-4 py-3 text-white placeholder-zinc-600 outline-none transition-all focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-all focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
          >
            <option value="all">All Status</option>

            <option value="pending">Pending</option>

            <option value="confirmed">Confirmed</option>

            <option value="completed">Completed</option>

            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-all focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
          >
            <option value="all">All Time</option>

            <option value="today">Today</option>

            <option value="week">Last 7 Days</option>

            <option value="month">Last 30 Days</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery || statusFilter !== "all" || dateFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setDateFilter("all");
              }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-zinc-400 transition-all hover:text-white"
            >
              <X size={18} />
              Clear
            </button>
          )}
        </div>

        {/* Results Count */}
        <p className="text-sm text-zinc-500">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>

      {/* Empty State */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-16 text-center backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white">
            No Booking Requests
          </h3>

          <p className="mt-2 text-zinc-500">
            Customer booking enquiries will appear here.
          </p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-16 text-center backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white">No Results Found</h3>

          <p className="mt-2 text-zinc-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBookings.map((booking) => (
            <ServiceCard
              key={booking.id}
              booking={booking}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ServiceModal
        open={modalOpen}
        booking={selectedBooking}
        onClose={() => {
          setModalOpen(false);

          setSelectedBooking(null);
        }}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
