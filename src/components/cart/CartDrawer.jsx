"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiShoppingBag, FiX } from "react-icons/fi";
import { useCart } from "@/context/CartContext";

import CartItem from "./CartItem";

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();

  const removeItem = (item) => {
    removeFromCart(item.id, item.duration);
  };

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0,
    );
  }, [cart]);

  const handleWhatsApp = () => {
    if (cart.length === 0) return;

    let message = "Hello Friendly Camera Rentals,%0A%0AI want to rent:%0A";

    cart.forEach((item, index) => {
      message += `%0A${index + 1}. ${item.name}`;
      message += `%0ADuration: ${item.duration}`;
      message += `%0APrice: ₹${item.price}%0A`;
    });

    message += `%0ATotal: ₹${total}`;

    window.open(`https://wa.me/918639852224?text=${message}`, "_blank");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
            }}
            className="fixed right-0 top-0 z-[999] flex h-screen w-full max-w-md flex-col border-l border-white/10 bg-black"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold text-white">Your Cart</h2>

              <button
                onClick={onClose}
                className="rounded-full p-2 text-zinc-400 hover:bg-white/10 cursor-pointer"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <FiShoppingBag size={70} className="text-zinc-700" />

                  <h3 className="mt-5 text-2xl font-semibold text-white">
                    Your cart is empty
                  </h3>

                  <p className="mt-2 text-zinc-400">
                    Add rental equipment to continue.
                  </p>

                  <button
                    onClick={() => {
                      onClose();

                      setTimeout(() => {
                        router.push("/rental");
                      }, 200);
                    }}
                    className="mt-6 rounded-full border border-white/10 px-6 py-3 text-white transition hover:border-[#F5A623] hover:text-[#F5A623] cursor-pointer"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <CartItem
                      key={`${item.id}-${item.duration}`}
                      item={item}
                      onRemove={() => removeFromCart(item.id, item.duration)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-white/10 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-zinc-400">Total</span>

                  <span className="text-3xl font-bold text-amber-400">
                    ₹{total}
                  </span>
                </div>

                <button
                  onClick={handleWhatsApp}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-500 py-4 font-semibold text-white transition hover:bg-green-600"
                >
                  <FaWhatsapp size={20} />
                  Book Rent via WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
