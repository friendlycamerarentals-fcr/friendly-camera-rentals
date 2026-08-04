"use client";

import { useState } from "react";
import ImageUploader from "@/components/common/ImageUploader";
import { uploadProductImages } from "@/lib/upload";
import { separateImages } from "@/lib/imageUtils";

const normalizeStatus = (status) => {
  if (!status) {
    return "In Stock";
  }
  const normalized = String(status).toLowerCase();
  if (normalized === "available" || normalized === "in stock") {
    return "In Stock";
  }
  if (normalized === "reserved" || normalized === "out of stock") {
    return "Out of Stock";
  }
  if (normalized === "sold") {
    return "Sold";
  }
  return status;
};

const normalizeSpecifications = (specifications) => {
  if (Array.isArray(specifications) && specifications.length > 0) {
    return specifications;
  }

  if (specifications && typeof specifications === "object") {
    return Object.entries(specifications).map(([label, value]) => ({
      label: String(label),
      value: String(value),
    }));
  }

  return [
    {
      label: "",
      value: "",
    },
  ];
};

export default function BuyProductForm({
  initialData = {},
  onSubmit,
  loading = false,
}) {
  const [images, setImages] = useState(
    initialData.images?.length > 0
      ? initialData.images
      : initialData.image
        ? [initialData.image]
        : [],
  );

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    brand: initialData.brand || "",
    model: initialData.model || "",
    category: initialData.category || "camera",
    condition: initialData.condition || "Like New",
    warranty: initialData.warranty || "No Warranty",
    status: normalizeStatus(initialData.status),
    price: initialData.price ?? 0,
    description: initialData.description || "",
    specifications: normalizeSpecifications(initialData.specifications),
    accessories:
      initialData.accessories?.length > 0 ? initialData.accessories : [""],
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        {
          label: "",
          value: "",
        },
      ],
    }));
  };

  const removeSpecification = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const updateSpecification = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addAccessory = () => {
    setFormData((prev) => ({
      ...prev,
      accessories: [...prev.accessories, ""],
    }));
  };

  const removeAccessory = (index) => {
    setFormData((prev) => ({
      ...prev,
      accessories: prev.accessories.filter((_, i) => i !== index),
    }));
  };

  const updateAccessory = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      accessories: prev.accessories.map((item, i) =>
        i === index ? value : item,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const slug =
      formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-") || `product-${Date.now()}`;

    let uploadedImages = [];

    try {
      uploadedImages = await uploadProductImages(images, "buy-products");
    } catch (error) {
      throw new Error(error.message || "Image upload failed");
    }

    const filteredSpecifications = formData.specifications.filter(
      (spec) => spec.label.trim() && spec.value.trim(),
    );

    const specifications = filteredSpecifications.length
      ? Object.fromEntries(
          filteredSpecifications.map((spec) => [
            spec.label.trim(),
            spec.value.trim(),
          ]),
        )
      : {};

    const filteredAccessories = formData.accessories
      .map((item) => item.trim())
      .filter(Boolean);

    // Separate images: first becomes thumbnail, rest go to gallery
    const { image: thumbnail, images: galleryImages } =
      separateImages(uploadedImages);

    onSubmit({
      ...formData,
      slug,
      price: Number(formData.price || 0),
      status: normalizeStatus(formData.status),
      image: thumbnail,
      images: galleryImages,
      specifications,
      accessories: filteredAccessories,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4 md:p-6">
        <h2 className="mb-4 text-xl md:mb-6 font-semibold text-white">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="rounded-2xl border border-white/10 bg-black px-4 text-sm h-10 md:h-auto py-2.5 md:py-3 placeholder:text-sm md:text-base md:placeholder:text-base text-white"
            required
          />

          <input
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Brand"
            className="rounded-2xl border border-white/10 bg-black px-4 text-sm h-10 md:h-auto py-2.5 md:py-3 placeholder:text-sm md:text-base md:placeholder:text-base text-white"
            required
          />

          <input
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Model"
            className="rounded-2xl border border-white/10 bg-black px-4 text-sm h-10 md:h-auto py-2.5 md:py-3 placeholder:text-sm md:text-base md:placeholder:text-base text-white"
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-black px-4 text-sm h-10 md:h-auto py-2.5 md:py-3 md:text-base text-white"
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

          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
          >
            <option>Brand New</option>
            <option>Like New</option>
            <option>Excellent</option>
            <option>Good</option>
            <option>Used</option>
          </select>

          <input
            name="warranty"
            value={formData.warranty}
            onChange={handleChange}
            placeholder="Warranty"
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
          >
            <option>In Stock</option>
            <option>Out of Stock</option>
            <option>Sold</option>
          </select>
        </div>

        <textarea
          rows={5}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="mt-4 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
        />
      </div>

      {/* Images */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <h2 className="mb-6 text-xl font-semibold text-white">
          Product Images
        </h2>

        <ImageUploader
          images={images}
          setImages={setImages}
          folder="buy-products"
          maxFiles={10}
        />
      </div>

      {/* Purchase Price */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <h2 className="mb-6 text-xl font-semibold text-white">
          Purchase Price
        </h2>

        <div className="relative w-full max-w-sm">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            ₹
          </span>
          <input
            type="number"
            name="price"
            value={formData.price}
            min="0"
            onChange={handleChange}
            placeholder="Purchase Price"
            className="w-full rounded-2xl border border-white/10 bg-black px-11 py-3 text-white outline-none"
            required
          />
        </div>
      </div>

      {/* Specifications */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-white">Specifications</h2>

          <button
            type="button"
            onClick={addSpecification}
            className="w-full rounded-xl bg-[#F5A623] px-4 py-3 text-black sm:w-auto cursor-pointer"
          >
            + Add Specification
          </button>
        </div>

        <div className="space-y-4">
          {formData.specifications.map((item, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) =>
                    updateSpecification(index, "label", e.target.value)
                  }
                  placeholder="Specification Name"
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
                />
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) =>
                    updateSpecification(index, "value", e.target.value)
                  }
                  placeholder="Specification Value"
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 transition hover:bg-red-500/20 sm:w-auto cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Accessories */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-white">Accessories</h2>

          <button
            type="button"
            onClick={addAccessory}
            className="w-full rounded-xl bg-[#F5A623] px-4 py-3 text-black sm:w-auto cursor-pointer"
          >
            + Add Accessory
          </button>
        </div>

        <div className="space-y-4">
          {formData.accessories.map((item, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <input
                type="text"
                value={item}
                onChange={(e) => updateAccessory(index, e.target.value)}
                placeholder="Accessory"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white"
              />
              <button
                type="button"
                onClick={() => removeAccessory(index)}
                className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 transition hover:bg-red-500/20 sm:w-auto cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-[#F5A623] px-8 py-3 font-semibold text-black cursor-pointer"
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
