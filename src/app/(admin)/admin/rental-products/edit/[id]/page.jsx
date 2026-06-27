"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import RentalProductForm from "@/components/admin/rental-products/RentalProductForm";

export default function EditRentalProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/rental-products/${params.id}`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (result.success) {
        setProduct(result.data);
      }
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);

      const response = await fetch(`/api/rental-products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success("Product updated successfully");
      router.push("/admin/rental-products");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950 py-20 text-center text-zinc-500">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 py-20 text-center text-red-400">
        Product not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Edit Rental Product
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Update rental product information
        </p>
      </div>

      <RentalProductForm
        initialData={product}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}
