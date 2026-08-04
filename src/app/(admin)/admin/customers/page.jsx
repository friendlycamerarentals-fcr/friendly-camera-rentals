"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { useFetchData } from "@/hooks/useFetchData";
import CustomerCard from "@/components/admin/customers/CustomerCard";
import CustomerModal from "@/components/admin/customers/CustomerModal";

export default function CustomersPage() {
  // Use custom hook for data fetching and refetching
  const { data: customers, loading } = useFetchData("/api/customers");

  const [search, setSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const query = search.toLowerCase();

      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.customerId?.toLowerCase().includes(query) ||
        customer.phoneNumber?.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  const handleView = (customer) => {
    setSelectedCustomer(customer);

    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-zinc-400">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Customers</h1>

        <p className="mt-2 text-zinc-500">
          View and manage all registered customers.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          type="text"
          placeholder="Search by Name, Customer ID or Phone Number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-4 pl-12 pr-4 text-white outline-none focus:border-[#F5A623]"
        />
      </div>

      {/* Empty */}
      {filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-16 text-center">
          <h3 className="text-xl font-semibold text-white">
            No Customers Found
          </h3>

          <p className="mt-2 text-zinc-500">
            Customer accounts will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <CustomerModal
        open={modalOpen}
        customer={selectedCustomer}
        onClose={() => {
          setModalOpen(false);

          setSelectedCustomer(null);
        }}
      />
    </div>
  );
}
