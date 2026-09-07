"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useFetchData } from "@/hooks/useFetchData";
import { invalidateCache } from "@/lib/dataCache";
import RentalProductStats from "@/components/admin/rental-products/RentalProductStats";
import RentalProductFilters from "@/components/admin/rental-products/RentalProductFilters";
import RentalProductTable from "@/components/admin/rental-products/RentalProductTable";
import RentalProductModal from "@/components/admin/rental-products/RentalProductModal";
import DeleteProductDialog from "@/components/admin/rental-products/DeleteProductDialog";
import ReorderProductsModal from "@/components/admin/products/ReorderProductsModal";

export default function RentalProductsPage() {
  // Use custom hook for data fetching and refetching
  const {
    data: products,
    loading,
    refetch,
    setData,
  } = useFetchData("/api/rental-products");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);

  const [reorderOpen, setReorderOpen] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.brand?.toLowerCase().includes(search.toLowerCase()) ||
        product.model?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || product.category === category;

      const matchesStatus =
        status === "all" ||
        (status === "available" && product.available) ||
        (status === "unavailable" && !product.available);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  const handleView = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleDeleteClick = (product) => {
    setDeleteProduct(product);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;

    try {
      const response = await fetch(`/api/rental-products/${deleteProduct.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Optimistic update
        setData((prev) => prev.filter((item) => item.id !== deleteProduct.id));
        toast.success("Product deleted successfully");

        // Refetch to ensure consistency
        invalidateCache("/api/rental-products");
        await refetch(false);
      }

      setDeleteOpen(false);
      setDeleteProduct(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleStatusChange = async (productId, available) => {
    try {
      const response = await fetch(`/api/rental-products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ available }),
      });

      const result = await response.json();

      if (result.success) {
        // Optimistic update
        setData((prev) =>
          prev.map((product) =>
            product.id === productId
              ? { ...product, available: result.data.available }
              : product,
          ),
        );
        toast.success("Product status updated");

        // Refetch to ensure consistency
        invalidateCache("/api/rental-products");
        await refetch(false);
      }
    } catch (error) {
      console.error("Failed to update rental product status:", error);
      toast.error("Failed to update product status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Rental Products
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage rental products inventory
        </p>
      </div>

      {/* Stats */}
      <RentalProductStats products={products} />

      {/* Filters */}
      <RentalProductFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
        onReorder={() => setReorderOpen(true)}
      />

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 py-20 text-center text-zinc-500">
          Loading rental products...
        </div>
      ) : (
        <RentalProductTable
          products={filteredProducts}
          onView={handleView}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* View Modal */}
      <RentalProductModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        product={selectedProduct}
      />

      {/* Delete Dialog */}
      <DeleteProductDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        product={deleteProduct}
        onConfirm={handleDelete}
      />

      {/* Reorder Modal */}
      <ReorderProductsModal
        open={reorderOpen}
        onClose={() => setReorderOpen(false)}
        products={filteredProducts}
        productType="rental"
        onSave={() => refetch(false)}
        loading={reorderLoading}
      />
    </div>
  );
}
