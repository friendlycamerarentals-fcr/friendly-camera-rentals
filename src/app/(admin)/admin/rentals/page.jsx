"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import RentalStats from "@/components/admin/rentals/RentalStats";
import RentalFilters from "@/components/admin/rentals/RentalFilters";
import RentalTable from "@/components/admin/rentals/RentalTable";
import RentalDetailsModal from "@/components/admin/rentals/RentalDetailsModal";
import ManualRentalForm from "@/components/admin/rentals/ManualRentalForm";
import { openRentalWhatsApp } from "@/lib/whatsappBookingMessage";

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
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let active = true;

    fetch("/api/rental-requests")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load rental requests");
        }
        if (active) setBookings(result.data || []);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to load rental requests");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
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
      setActionLoadingId(id);
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
          booking.id === id ? { ...booking, ...result.data } : booking,
        ),
      );
      if (selectedBooking?.id === id) {
        setSelectedBooking((prev) => ({ ...prev, ...result.data }));
      }
      toast.success(
        nextStatus === "Confirmed"
          ? "Rental confirmed."
          : "Rental request updated.",
      );
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to update status");
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRecordPayment = async (id, paymentPayload) => {
    try {
      setActionLoadingId(id);
      const response = await fetch(`/api/rental-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment: paymentPayload }),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Failed to record advance payment");

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, ...result.data } : booking,
        ),
      );
      if (selectedBooking?.id === id) {
        setSelectedBooking((prev) => ({ ...prev, ...result.data }));
      }
      toast.success(
        `${result.paymentRecord?.paymentType || paymentPayload.paymentType || "Payment"} payment recorded and verified (${result.paymentRecord?.method || "payment"}).`,
      );
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to record advance payment");
      return false;
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleManualCreated = (booking) => {
    if (booking) {
      setBookings((prev) => [booking, ...prev]);
    }
  };

  const handleWhatsAppAction = (booking) => {
    if (!openRentalWhatsApp(booking)) {
      toast.error("No valid phone number is saved on this booking.");
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
      setActionLoadingId(id);
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
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">📸 Rentals</h1>
          <p className="mt-2 text-zinc-400">
            Manage rental bookings and customers.
          </p>
        </div>
        <button
          onClick={() => setManualFormOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#F5A623] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#F5A623]/90 cursor-pointer"
        >
          + Manual Booking
        </button>
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
          onWhatsApp={handleWhatsAppAction}
          actionLoadingId={actionLoadingId}
        />
      )}

      <RentalDetailsModal
        open={openModal}
        booking={selectedBooking}
        onClose={handleCloseModal}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onSave={handleSavePayment}
        onRecordPayment={handleRecordPayment}
        onWhatsApp={handleWhatsAppAction}
        actionLoading={Boolean(actionLoadingId)}
      />

      <ManualRentalForm
        open={manualFormOpen}
        onClose={() => setManualFormOpen(false)}
        onCreated={handleManualCreated}
      />
    </div>
  );
}
