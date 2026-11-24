"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import RentalProductForm from "@/components/admin/rental-products/RentalProductForm";

export default function EditRentalProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetch(`/api/rental-products/${productId}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((result) => {
        if (active && result.success) {
          setProduct(result.data);
        }
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") {
          console.error("Failed to load product:", error);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [productId]);

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);

      const response = await fetch(`/api/rental-products/${productId}`, {
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
