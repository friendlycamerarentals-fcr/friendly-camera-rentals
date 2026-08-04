"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import BuyProductForm from "@/components/admin/buy-products/BuyProductForm";

export default function EditBuyProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchProduct();
    }
  }, [params]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/buy-products/${params.id}`);

      const result = await response.json();

      if (result.success) {
        setProduct(result.data);
      } else {
        toast.error("Product not found");
        router.push("/admin/buy-products");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);

      const response = await fetch(`/api/buy-products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      let result;
      try {
        result = await response.json();
      } catch (error) {
        const text = await response.text();
        throw new Error(text || "Failed to parse server response");
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result?.message || response.statusText || "Failed to update product",
        );
      }

      toast.success("Product updated successfully");
      router.push("/admin/buy-products");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950 py-20 text-center">
        <p className="text-zinc-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 py-20 text-center">
        <p className="text-red-400">Product not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Edit Buy Product</h1>

        <p className="mt-1 text-sm text-zinc-500">Update product details</p>
      </div>

      {/* Form */}
      <BuyProductForm
        initialData={product}
        loading={saving}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
