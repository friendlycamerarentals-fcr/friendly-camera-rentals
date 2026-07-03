"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useBookingFlow } from "@/context/BookingFlowContext";

export default function FloatingWhatsApp() {
  const { isCartVisible, isProfileVisible } = useBookingFlow();

  // Hide when cart or profile modals/pages are visible
  if (isCartVisible || isProfileVisible) return null;

  const phone = "918639852224";

  const message = encodeURIComponent(
    "Hi Friendly Camera Rentals, I'm interested in renting camera equipment.",
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-10 right-10 z-[999]"
    >
      <div className="relative group">
        {/* Tooltip */}
        <div className="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/90 px-4 py-2 text-sm text-white opacity-0 shadow-[0_0px_25px_rgba(37,211,102,0.4)] backdrop-blur-xl transition-all duration-300 group-hover:opacity-100 md:block">
          Chat with FCR
        </div>

        {/* Pulse Ring */}
        <span className="absolute inset-0 -z-10 h-14 w-14 animate-ping rounded-full bg-green-500/30" />

        {/* WhatsApp Button */}
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_15px_40px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110">
          <FaWhatsapp size={32} />
        </div>
      </div>
    </a>
  );
}
