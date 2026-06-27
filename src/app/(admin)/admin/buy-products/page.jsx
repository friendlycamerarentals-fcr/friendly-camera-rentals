"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useFetchData } from "@/hooks/useFetchData";
import BuyProductStats from "@/components/admin/buy-products/BuyProductStats";
import BuyProductFilters from "@/components/admin/buy-products/BuyProductFilters";
import BuyProductTable from "@/components/admin/buy-products/BuyProductTable";
import BuyProductModal from "@/components/admin/buy-products/BuyProductModal";
import DeleteProductDialog from "@/components/admin/buy-products/DeleteProductDialog";
import ReorderProductsModal from "@/components/admin/products/ReorderProductsModal";

export default function BuyProductsPage() {
  // Use custom hook for data fetching and refetching
  const {
    data: products,
    loading,
    refetch,
    setData,
  } = useFetchData("/api/buy-products");

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

      const matchesStatus = status === "all" || product.status === status;

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
    try {
      const response = await fetch(`/api/buy-products/${deleteProduct.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Optimistic update
        setData((prev) => prev.filter((item) => item.id !== deleteProduct.id));
        toast.success("Product deleted successfully");

        // Refetch to ensure consistency
        await refetch(false);
      }

      setDeleteOpen(false);
      setDeleteProduct(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleStatusChange = async (productId, status) => {
    try {
      const response = await fetch(`/api/buy-products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        // Optimistic update
        setData((prev) =>
          prev.map((product) =>
            product.id === productId
              ? { ...product, status: result.data.status }
              : product,
          ),
        );
        toast.success("Product status updated");

        // Refetch to ensure consistency
        await refetch(false);
      }
    } catch (error) {
      console.error("Failed to update product status:", error);
      toast.error("Failed to update product status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Buy Products
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage products available for purchase
        </p>
      </div>

      {/* Stats */}
      <BuyProductStats products={products} />

      {/* Filters */}
      <BuyProductFilters
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
          Loading products...
        </div>
      ) : (
        <BuyProductTable
          products={filteredProducts}
          onView={handleView}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Product Modal */}
      <BuyProductModal
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
        productType="buy"
        onSave={() => refetch(false)}
        loading={reorderLoading}
      />
    </div>
  );
}
