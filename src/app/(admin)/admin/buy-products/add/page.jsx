"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import BuyProductForm from "@/components/admin/buy-products/BuyProductForm";

export default function AddBuyProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      const response = await fetch("/api/buy-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create product");
      }

      toast.success("Product created successfully");
      router.push("/admin/buy-products");
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Add Buy Product
        </h1>

        <p className="mt-1 text-sm text-zinc-500">Create a new buy product</p>
      </div>

      {/* Form */}
      <BuyProductForm loading={loading} onSubmit={handleSubmit} />
    </div>
  );
}
