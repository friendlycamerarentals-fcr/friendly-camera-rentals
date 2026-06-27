"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useFetchData } from "@/hooks/useFetchData";
import SellRequestStats from "@/components/admin/sell-requests/SellRequestStats";
import SellRequestFilters from "@/components/admin/sell-requests/SellRequestFilters";
import SellRequestTable from "@/components/admin/sell-requests/SellRequestTable";
import SellRequestModal from "@/components/admin/sell-requests/SellRequestModal";

export default function SellRequestsPage() {
  // Use custom hook for data fetching and refetching
  const {
    data: requests,
    loading,
    refetch,
    setData,
  } = useFetchData("/api/sell-requests");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const matchesSearch =
        item.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        item.brand?.toLowerCase().includes(search.toLowerCase()) ||
        item.model?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "all" || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, status]);

  const handleView = (request) => {
    setSelectedRequest(request);
    setOpenModal(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await fetch(`/api/sell-requests/${id}`, {
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

        setSelectedRequest((prev) =>
          prev
            ? {
                ...prev,
                status,
              }
            : null,
        );

        toast.success("Sell request status updated.");
        await refetch(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/sell-requests/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }

      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success("Sell request deleted successfully.");
      await refetch(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete request");
    }
  };

  return (
    <div className="space-y-6">
      <SellRequestStats requests={requests} />

      <SellRequestFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />

      <SellRequestTable
        requests={filteredRequests}
        loading={loading}
        onView={handleView}
        onDelete={handleDelete}
      />

      <SellRequestModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        request={selectedRequest}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
