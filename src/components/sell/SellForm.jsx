"use client";

import { useState } from "react";
import { toast } from "sonner";
import CategorySelector from "./CategorySelector";
import ConditionSelector from "./ConditionSelector";
import ImageUploader from "./ImageUploader";

export default function SellForm() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    category: "",
    brand: "",
    model: "",
    purchaseYear: "",
    condition: "",
    warranty: "",
    warrantyExpiry: "",
    accessories: "",
    expectedPrice: "",
    description: "",
  });

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.city ||
      !formData.category ||
      !formData.brand ||
      !formData.model ||
      !formData.purchaseYear ||
      !formData.condition ||
      !formData.warranty ||
      !formData.expectedPrice
    ) {
      toast.warning("Please fill all required fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    if (images.length === 0) {
      toast.warning("Please upload at least one product image.");
      return;
    }
    if (images.length > 5) {
      toast.warning("Maximum 5 images are allowed.");
      return;
    }

    if (formData.warranty === "Under Warranty" && !formData.warrantyExpiry) {
      toast.warning("Please select warranty expiry date.");
      return;
    }

    if (Number(formData.expectedPrice) <= 0) {
      toast.error("Expected price must be greater than ₹0.");
      return;
    }

    try {
      setLoading(true);

      const message = `
📸 *New Sell Request*

👤 Name: ${formData.name}
📞 Phone: ${formData.phone}
📧 Email: ${formData.email}

📍 City: ${formData.city}

📦 Category: ${formData.category}
🏷 Brand: ${formData.brand}
📸 Model: ${formData.model}

⭐ Condition: ${formData.condition}
📅 Purchase Year: ${formData.purchaseYear}
🛡 Warranty: ${formData.warranty}

${
  formData.warranty === "Under Warranty"
    ? `📆 Warranty Expiry: ${formData.warrantyExpiry}`
    : ""
}

💰 Expected Price: ₹${formData.expectedPrice}

🎁 Accessories:
${formData.accessories || "N/A"}

📝 Description:
${formData.description || "N/A"}

🖼 Images Uploaded: ${images.length}
      `;

      toast.success("Opening WhatsApp to submit your sell request...");

      const whatsappUrl = `https://wa.me/918639852224?text=${encodeURIComponent(
        message,
      )}`;

      setTimeout(() => {
        window.open(whatsappUrl, "_blank");

        setFormData({
          name: "",
          phone: "",
          email: "",
          city: "",
          category: "",
          brand: "",
          model: "",
          purchaseYear: "",
          condition: "",
          warranty: "",
          warrantyExpiry: "",
          accessories: "",
          expectedPrice: "",
          description: "",
        });

        setImages([]);

        setLoading(false);

        toast.success("WhatsApp opened successfully.");
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Failed to submit request.");
    }
  };

  return (
    <form
      id="sell-form"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <input
          type="text"
          name="name"
          placeholder="Full Name *"
          value={formData.name}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none transition focus:border-[#F5A623]"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Mobile Number *"
          value={formData.phone}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none transition focus:border-[#F5A623]"
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none transition focus:border-[#F5A623]"
        />

        <input
          type="text"
          name="city"
          placeholder="City *"
          value={formData.city}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none transition focus:border-[#F5A623]"
        />

        <input
          type="text"
          name="brand"
          placeholder="Brand *"
          value={formData.brand}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none transition focus:border-[#F5A623]"
        />

        <input
          type="text"
          name="model"
          placeholder="Model *"
          value={formData.model}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none transition focus:border-[#F5A623]"
        />

        <select
          name="purchaseYear"
          value={formData.purchaseYear}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all duration-300 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
        >
          <option value="" className="bg-black">
            Purchase Year
          </option>

          {Array.from({ length: new Date().getFullYear() - 2009 }, (_, i) => {
            const year = new Date().getFullYear() - i;

            return (
              <option key={year} value={year} className="bg-black text-white">
                {year}
              </option>
            );
          })}
        </select>

        <select
          name="warranty"
          value={formData.warranty}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all duration-300 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
        >
          <option value="" className="bg-black">
            Warranty Status
          </option>

          <option value="Under Warranty" className="bg-black">
            Under Warranty
          </option>

          <option value="Out of Warranty" className="bg-black">
            Out of Warranty
          </option>
        </select>

        {formData.warranty === "Under Warranty" && (
          <input
            type="month"
            name="warrantyExpiry"
            value={formData.warrantyExpiry}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 7)}
            className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition-all duration-300 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
          />
        )}

        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
            ₹
          </span>

          <input
            type="number"
            name="expectedPrice"
            placeholder="Expected Selling Price *"
            value={formData.expectedPrice}
            onChange={handleChange}
            min="1"
            className="appearance-none w-full rounded-2xl border border-white/10 bg-black/30 py-4 pl-10 pr-5 text-white outline-none transition-all duration-300 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
          />
        </div>
      </div>

      {/* Category */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">Select Category</h3>

        <CategorySelector
          value={formData.category}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              category: value,
            }))
          }
        />
      </div>

      {/* Condition */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">Product Condition</h3>

        <ConditionSelector
          value={formData.condition}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              condition: value,
            }))
          }
        />
      </div>

      {/* Accessories */}
      <textarea
        name="accessories"
        rows={3}
        placeholder="Accessories Included"
        value={formData.accessories}
        onChange={handleChange}
        className="mt-8 w-full rounded-2xl border border-white/10 bg-black/30 p-5 outline-none transition focus:border-[#F5A623]"
      />

      {/* Description */}
      <textarea
        name="description"
        rows={5}
        placeholder="Describe your product..."
        value={formData.description}
        onChange={handleChange}
        className="mt-5 w-full rounded-2xl border border-white/10 bg-black/30 p-5 outline-none transition focus:border-[#F5A623]"
      />

      {/* Images */}
      <div className="mt-8">
        <ImageUploader images={images} setImages={setImages} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full rounded-2xl bg-[#F5A623] py-4 font-semibold text-black transition-all duration-300 hover:bg-amber-400 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Opening WhatsApp..." : "Submit Sell Request"}
      </button>
    </form>
  );
}
