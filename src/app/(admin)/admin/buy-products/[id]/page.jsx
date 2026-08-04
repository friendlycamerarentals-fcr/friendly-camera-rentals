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
  }, [params?.id]);

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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update product");
      }

      toast.success("Product updated successfully");

      router.push("/admin/buy-products");
      router.refresh();
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Edit Buy Product
        </h1>

        <p className="mt-1 text-sm text-zinc-500">Update product information</p>
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
