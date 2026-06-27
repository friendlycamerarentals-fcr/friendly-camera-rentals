"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import RentalStats from "@/components/admin/rentals/RentalStats";
import RentalFilters from "@/components/admin/rentals/RentalFilters";
import RentalTable from "@/components/admin/rentals/RentalTable";
import RentalDetailsModal from "@/components/admin/rentals/RentalDetailsModal";

const MS = { "24h": 864e5, "7d": 6048e5, "30d": 2592e6, "365d": 31536e6 };

function filterAndSort(bookings, { search, status, time, sortBy, now }) {
  let result = [...bookings];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (b) =>
        b.requestId.toLowerCase().includes(q) ||
        b.fullName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.email?.toLowerCase().includes(q),
    );
  }

  if (status !== "all") {
    result = result.filter((b) => b.status === status);
  }

  if (time !== "all" && MS[time]) {
    result = result.filter(
      (b) => now - new Date(b.createdAt).getTime() <= MS[time],
    );
  }

  result.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "high":
        return b.totalAmount - a.totalAmount;
      case "low":
        return a.totalAmount - b.totalAmount;
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return result;
}

export default function RentalsPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [time, setTime] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/rental-requests");
      const result = await response.json();
      if (result.success) {
        setBookings(result.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load rental requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(
    () => filterAndSort(bookings, { search, status, time, sortBy, now }),
    [bookings, search, status, time, sortBy, now],
  );

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBooking(null);
  };

  const handleStatusChange = async (id, nextStatus) => {
    try {
      const response = await fetch(`/api/rental-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Failed to update status");
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: nextStatus } : booking,
        ),
      );
      toast.success("Rental request updated.");
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/rental-requests/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Failed to delete request");
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
      if (selectedBooking?.id === id) {
        handleCloseModal();
      }
      toast.success("Rental request deleted.");
    } catch (error) {
      toast.error(error.message || "Failed to delete request");
    }
  };

  const handleSavePayment = async (id, payload) => {
    try {
      const response = await fetch(`/api/rental-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Failed to save payment details");

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, ...result.data } : booking,
        ),
      );

      if (selectedBooking?.id === id) {
        setSelectedBooking((prev) => ({ ...prev, ...result.data }));
      }

      return true;
    } catch (error) {
      toast.error(error.message || "Failed to save payment details");
      return false;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">📸 Rentals</h1>
        <p className="mt-2 text-zinc-400">
          Manage rental bookings and customers.
        </p>
      </div>

      <RentalStats bookings={filteredBookings} />

      <RentalFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        time={time}
        setTime={setTime}
      />

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 text-center text-zinc-400">
          Loading rental requests...
        </div>
      ) : (
        <RentalTable
          bookings={filteredBookings}
          onView={handleView}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      <RentalDetailsModal
        open={openModal}
        booking={selectedBooking}
        onClose={handleCloseModal}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onSave={handleSavePayment}
      />
    </div>
  );
}
