"use client";

import { useState } from "react";
import ImageUploader from "@/components/common/ImageUploader";
import { uploadProductImages } from "@/lib/upload";
import { separateImages } from "@/lib/imageUtils";

const createPricingRow = () => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `pricing-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  unit: "hour",
  duration: 1,
  price: 0,
});

const parsePricingKey = (key, price) => {
  const lowerKey = key.toLowerCase();
  const duration = Number(lowerKey.replace(/[^0-9]/g, "")) || 1;
  const unit = lowerKey.includes("week")
    ? "week"
    : lowerKey.includes("day")
      ? "day"
      : "hour";

  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `pricing-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    unit,
    duration,
    price: Number(price || 0),
  };
};

const normalizePricing = (pricing) => {
  if (!pricing) {
    return [createPricingRow()];
  }

  if (Array.isArray(pricing) && pricing.length > 0) {
    return pricing.map((row) => ({
      id:
        row.id ||
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `pricing-${Date.now()}-${Math.random().toString(16).slice(2)}`),
      unit: row.unit || "hour",
      duration: row.duration ?? 1,
      price: row.price ?? 0,
    }));
  }

  if (typeof pricing === "object" && Object.keys(pricing).length > 0) {
    return Object.entries(pricing).map(([key, value]) =>
      parsePricingKey(key, value),
    );
  }

  return [createPricingRow()];
};

const formatPricingKey = ({ unit, duration }) => {
  const count = Number(duration) || 0;
  const normalizedUnit = (unit || "hour").toLowerCase();

  if (normalizedUnit === "hour") {
    return `${count}${count === 1 ? "hr" : "hrs"}`;
  }

  if (normalizedUnit === "day") {
    return `${count}${count === 1 ? "day" : "days"}`;
  }

  return `${count}${count === 1 ? "week" : "weeks"}`;
};

export default function RentalProductForm({
  initialData = {},
  onSubmit,
  loading = false,
}) {
  const [images, setImages] = useState(initialData.images || []);

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    brand: initialData.brand || "",
    model: initialData.model || "",
    category: initialData.category || "camera",
    megapixels: initialData.megapixels || "",
    batteries: initialData.batteries || 1,
    available: initialData.available ?? true,
    description: initialData.description || "",
    pricing: normalizePricing(initialData.pricing),
  });

  const [pricingErrors, setPricingErrors] = useState({});
  const [pricingGlobalError, setPricingGlobalError] = useState("");

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const addPricingRow = () => {
    setFormData((prev) => ({
      ...prev,
      pricing: [...prev.pricing, createPricingRow()],
    }));
    setPricingGlobalError("");
  };

  const removePricingRow = (id) => {
    setFormData((prev) => ({
      ...prev,
      pricing: prev.pricing.filter((item) => item.id !== id),
    }));

    setPricingErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updatePricingRow = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      pricing: prev.pricing.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "duration" || field === "price"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : value,
            }
          : item,
      ),
    }));

    setPricingErrors((prev) => {
      if (!prev[id] || !prev[id][field]) return prev;
      const rowErrors = { ...prev[id] };
      delete rowErrors[field];
      const next = { ...prev };
      if (Object.keys(rowErrors).length > 0) {
        next[id] = rowErrors;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const validatePricing = () => {
    if (formData.pricing.length === 0) {
      return {
        valid: false,
        errors: {},
        globalError: "At least one pricing option is required.",
      };
    }

    const errors = {};

    formData.pricing.forEach((item) => {
      const rowErrors = {};

      if (item.duration === "" || Number(item.duration) <= 0) {
        rowErrors.duration = "Must be greater than 0";
      }

      if (item.price === "" || Number(item.price) <= 0) {
        rowErrors.price = "Must be greater than 0";
      }

      if (Object.keys(rowErrors).length > 0) {
        errors[item.id] = rowErrors;
      }
    });

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      globalError: "",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validatePricing();

    if (!validation.valid) {
      setPricingErrors(validation.errors);
      setPricingGlobalError(validation.globalError);
      return;
    }

    setPricingErrors({});
    setPricingGlobalError("");

    const pricing = formData.pricing.reduce((acc, item) => {
      const key = formatPricingKey(item);
      const price = Number(item.price || 0);
      const duration = Number(item.duration || 0);

      if (!key || price <= 0 || duration <= 0) {
        return acc;
      }

      acc[key] = price;
      return acc;
    }, {});

    const uploadedImages = await uploadProductImages(images, "rental-products");

    onSubmit({
      ...formData,
      pricing,
      specifications: {
        megapixels: formData.megapixels || "",
        batteries: Number(formData.batteries || 0),
      },
      image: separateImages(uploadedImages).image,
      images: separateImages(uploadedImages).images,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950 p-4 md:p-6">
        <h2 className="mb-6 text-lg md:text-xl font-semibold text-white">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#F5A623]"
            required
          />

          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Brand"
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#F5A623]"
            required
          />

          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Model"
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#F5A623]"
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
          >
            <option value="camera">Camera</option>
            <option value="lens">Lens</option>
            <option value="drone">Drone</option>
            <option value="gimbal">Gimbal</option>
            <option value="light">Light</option>
            <option value="audio">Audio</option>
            <option value="tripod">Tripod</option>
            <option value="accessories">Accessories</option>
          </select>

          <input
            type="text"
            name="megapixels"
            value={formData.megapixels}
            onChange={handleChange}
            placeholder="Megapixels (Example: 24 MP)"
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#F5A623]"
          />

          <input
            type="number"
            name="batteries"
            value={formData.batteries}
            onChange={handleChange}
            placeholder="Number of Batteries"
            min="0"
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#F5A623]"
          />

          <select
            name="available"
            value={String(formData.available)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                available: e.target.value === "true",
              }))
            }
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
          >
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={5}
          placeholder="Product Description"
          className="mt-4 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#F5A623]"
        />
      </div>

      {/* Images */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950 p-4 md:p-6">
        <h2 className="mb-6 text-lg md:text-xl font-semibold text-white">
          Product Images
        </h2>

        <ImageUploader
          images={images}
          setImages={setImages}
          maxFiles={10}
          folder="rental-products"
        />
      </div>

      {/* Rental Pricing */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950 p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white md:text-xl">
            Rental Pricing
          </h2>

          <button
            type="button"
            onClick={addPricingRow}
            className="rounded-xl bg-[#F5A623] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 cursor-pointer"
          >
            + Add Pricing
          </button>
        </div>

        {pricingGlobalError && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {pricingGlobalError}
          </div>
        )}

        <div className="space-y-4">
          {formData.pricing.map((item) => {
            const rowError = pricingErrors[item.id] || {};

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-start">
                  {/* Unit */}
                  <select
                    value={item.unit}
                    onChange={(e) =>
                      updatePricingRow(item.id, "unit", e.target.value)
                    }
                    aria-label="Duration type"
                    className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
                  >
                    <option value="hour">Hours</option>
                    <option value="day">Days</option>
                    <option value="week">Weeks</option>
                  </select>

                  {/* Duration */}
                  <div className="flex flex-col gap-1">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.duration}
                      onChange={(e) =>
                        updatePricingRow(item.id, "duration", e.target.value)
                      }
                      placeholder="Duration"
                      aria-label="Duration"
                      className={`rounded-xl border bg-black px-4 py-3 text-white outline-none ${
                        rowError.duration
                          ? "border-red-500/60 focus:border-red-500"
                          : "border-white/10 focus:border-[#F5A623]"
                      }`}
                    />
                    {rowError.duration && (
                      <p className="text-xs text-red-400">
                        {rowError.duration}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.price}
                        onChange={(e) =>
                          updatePricingRow(item.id, "price", e.target.value)
                        }
                        placeholder="Price"
                        aria-label="Price"
                        className={`w-full rounded-xl border bg-black py-3 pl-8 pr-4 text-white outline-none ${
                          rowError.price
                            ? "border-red-500/60 focus:border-red-500"
                            : "border-white/10 focus:border-[#F5A623]"
                        }`}
                      />
                    </div>
                    {rowError.price && (
                      <p className="text-xs text-red-400">{rowError.price}</p>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removePricingRow(item.id)}
                    disabled={formData.pricing.length === 1}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 transition hover:bg-red-500/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-[#F5A623] px-6 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {loading
            ? "Saving..."
            : initialData.id
              ? "Update Product"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}
