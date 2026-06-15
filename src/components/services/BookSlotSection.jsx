"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";

export default function BookSlotSection() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    location: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-GB")
    : "Not Selected";

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.phone ||
      !selectedDate ||
      !formData.location
    ) {
      toast.warning("Please fill all required fields.");
      return;
    }

    if (!formData.service) {
      toast.warning("Please select a shoot type.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    const message = `
📸 *New Service Booking*

👤 Name: ${formData.name}
📞 Phone: ${formData.phone}

🎯 Service: ${formData.service}
📅 Event Date: ${formattedDate}
📍 Location: ${formData.location}



📝 Message:
${formData.message || "N/A"}
    `;

    const whatsappUrl = `https://wa.me/918639852224?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp...");
  };

  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#F5A623]/20 bg-black px-6 py-12 md:px-10">
          <h2 className="text-center font-heading text-4xl text-white md:text-6xl">
            Book Your <span className="text-[#F5A623]">Slot</span>
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="rounded-2xl border border-white/10 bg-transparent px-6 py-5 text-white outline-none focus:border-[#F5A623]"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="rounded-2xl border border-white/10 bg-transparent px-6 py-5 text-white outline-none focus:border-[#F5A623]"
            />

            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="rounded-2xl border border-white/10 bg-transparent px-6 py-5 text-white outline-none transition-all duration-300 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
            >
              <option value="" className="bg-black text-zinc-400">
                Select Shoot Type *
              </option>

              <option value="Wedding Shoot" className="bg-black">
                Wedding Shoot
              </option>

              <option value="Photography" className="bg-black">
                Photography
              </option>

              <option value="Videography" className="bg-black">
                Videography
              </option>

              <option value="Reels Creation" className="bg-black">
                Reels Creation
              </option>

              <option value="Album Design & Printing" className="bg-black">
                Album Design & Printing
              </option>

              <option value="Photo Printing" className="bg-black">
                Photo Printing
              </option>

              <option value="Photo Editing" className="bg-black">
                Photo Editing
              </option>

              <option value="Video Editing" className="bg-black">
                Video Editing
              </option>

              <option value="3D Invitation Website" className="bg-black">
                3D Invitation Website
              </option>
            </select>

            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              placeholderText="Select Event Date *"
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              showMonthDropdown
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={20}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-6 py-5 text-white outline-none transition-all duration-300 hover:border-[#F5A623]/60 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
              calendarClassName="bg-black border border-white/10 rounded-2xl"
            />

            <input
              type="text"
              name="location"
              placeholder="Event Location"
              value={formData.location}
              onChange={handleChange}
              className="md:col-span-2 rounded-2xl border border-[#F5A623]/40 bg-transparent px-6 py-5 text-white outline-none focus:border-[#F5A623]"
            />

            <textarea
              rows={6}
              name="message"
              placeholder="Tell us about your event..."
              value={formData.message}
              onChange={handleChange}
              className="md:col-span-2 rounded-2xl border border-white/10 bg-transparent p-6 text-white outline-none focus:border-[#F5A623]"
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-8 inline-flex w-50% items-center justify-center gap-3 rounded-full border border-green-500/30 bg-white/5 px-8 py-5 font-bold uppercase tracking-[0.3em] text-white shadow-[0_0_25px_rgba(34,197,94,0.25)] transition-all duration-300 hover:scale-[1.02] hover:border-green-500 hover:text-green-400 hover:shadow-[0_0_40px_rgba(34,197,94,0.55)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <FaWhatsapp size={24} className="text-green-500" />

              {loading ? "Opening WhatsApp..." : "Book Slot Via WhatsApp"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
