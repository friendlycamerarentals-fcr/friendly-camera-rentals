"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import RentalProductForm from "@/components/admin/rental-products/RentalProductForm";

export default function AddRentalProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        slug: generateSlug(data.name),
      };

      const response = await fetch("/api/rental-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to create product");
      }

      toast.success("Rental product created successfully");
      router.push("/admin/rental-products");
    } catch (error) {
      console.error("Create product error:", error);
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
          Add Rental Product
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Create a new rental product
        </p>
      </div>

      {/* Form */}
      <RentalProductForm loading={loading} onSubmit={handleSubmit} />
    </div>
  );
}
