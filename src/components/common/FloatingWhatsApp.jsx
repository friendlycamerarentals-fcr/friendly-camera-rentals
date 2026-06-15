"use client";

import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function FloatingWhatsApp() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const handleCartOpen = () => setHide(true);
    const handleCartClose = () => setHide(false);

    window.addEventListener("cart-open", handleCartOpen);
    window.addEventListener("cart-close", handleCartClose);

    return () => {
      window.removeEventListener("cart-open", handleCartOpen);
      window.removeEventListener("cart-close", handleCartClose);
    };
  }, []);

  const phone = "918639852224";

  const message = encodeURIComponent(
    "Hi Friendly Camera Rentals, I'm interested in renting camera equipment.",
  );

  if (hide) return null;

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-10 right-10 z-[999] flex items-center"
    >
      {/* Tooltip */}
      <div className="mr-3 rounded-full border border-white/10 bg-black/90 px-4 py-2 text-sm text-white backdrop-blur-xl opacity-0 transition-all duration-300 group-hover:opacity-100">
        Chat with us
      </div>

      <div className="relative">
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
