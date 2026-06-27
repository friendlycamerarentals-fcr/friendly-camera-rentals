"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.message.trim()
    ) {
      toast.warning("Please fill all required fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send message.");
      }

      toast.success("Message sent successfully. We'll be in touch soon.");
      setFormData({ name: "", phone: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_15px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_20px_70px_rgba(245,166,35,0.12)] md:p-10">
      <h2 className="font-heading text-4xl font-semibold md:text-5xl">
        Send a Message
      </h2>

      <p className="mt-3 text-zinc-400">We'd love to hear from you.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          type="text"
          placeholder="Your Name"
          className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none transition-all duration-300 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,166,35,0.2)]"
        />

        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          type="tel"
          placeholder="Phone Number"
          className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none transition-all duration-300 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,166,35,0.2)]"
        />

        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          placeholder="Your Message"
          className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none transition-all duration-300 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,166,35,0.2)]"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-amber-500 px-8 py-4 font-semibold text-black shadow-[0_8px_30px_rgba(245,166,35,0.35)] transition-all duration-300 hover:scale-105 hover:bg-amber-400 hover:shadow-[0_12px_40px_rgba(245,166,35,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
