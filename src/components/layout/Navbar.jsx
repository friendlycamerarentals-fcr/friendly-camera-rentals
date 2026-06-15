"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react"; // [9] added useCallback
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { FaShoppingCart } from "react-icons/fa";
import CartDrawer from "@/components/cart/CartDrawer";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Rental", href: "/rental" },
  { name: "Buy", href: "/buy" },
  { name: "Sell", href: "/sell" },
  { name: "Services", href: "/services" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cart } = useCart();

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl"
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-24 max-w-7xl items-center justify-between px-2 md:px-6 lg:px-8"
      >
        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
        >
          <Image
            src="/logo.png"
            alt="Friendly Camera Rentals Logo"
            width={60}
            height={60}
            priority
            className="h-18 w-auto object-contain"
          />
          <div className="hidden sm:block">
            <h2 className="font-heading text-xl font-semibold tracking-wide text-white">
              Friendly Camera Rentals
            </h2>
            <p className="text-xs uppercase tracking-[0.25em] text-[#F5A623]">
              Rent • Buy • Sell
            </p>
          </div>
        </Link>

        {/* ── Desktop Nav Links ─────────────────────────────────────────── */}
        <ul role="list" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined} // [8] screen-reader page indicator
                  className={`font-heading relative text-xl font-semibold tracking-wide transition-all duration-300
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded
                    ${isActive ? "text-[#F5A623]" : "text-zinc-300 hover:text-[#F5A623]"}`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="active-nav"
                      className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-[#F5A623]"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── Desktop Right Side ───────────────────────────────────────── */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Cart Button — [1] opens drawer, no /cart page link */}
          <button
            onClick={() => {
              setIsCartOpen(true);
              window.dispatchEvent(new Event("cart-open"));
            }} // [5] opens CartDrawer
            // [8] Dynamic aria-label communicates badge count to screen readers
            aria-label={
              cartCount > 0
                ? `Open cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`
                : "Open cart"
            }
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white
              transition-all duration-300 hover:border-[#F5A623] hover:text-[#F5A623]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer"
          >
            <FaShoppingCart size={18} aria-hidden="true" />
            {/* [2] Badge uses cartCount derived from cart.length */}
            {cartCount > 0 && (
              <span
                aria-hidden="true" // count already in aria-label above
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#F5A623] text-xs font-bold text-black"
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Contact Button */}
          <Link
            href="/contact"
            className="flex items-center gap-2 rounded-full bg-[#F5A623] px-4 py-3 font-semibold text-black
              shadow-[0_10px_30px_rgba(245,166,35,0.25)] transition-all duration-300
              hover:scale-105 hover:bg-amber-400
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5A623]"
          >
            Contact Us
          </Link>
        </div>

        {/* ── Mobile Controls (hamburger + cart) ───────────────────────── */}
        <div className="flex items-center gap-3 md:hidden">
          {/* [7] Mobile cart button — visible on small screens */}
          <button
            onClick={() => {
              setIsCartOpen(true);
              window.dispatchEvent(new Event("cart-open"));
            }}
            aria-label={
              cartCount > 0
                ? `Open cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`
                : "Open cart"
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white
              transition-all duration-300 hover:border-[#F5A623] hover:text-[#F5A623]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <FaShoppingCart size={16} aria-hidden="true" />
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F5A623] text-[10px] font-bold text-black"
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger Toggle */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            // [8] aria-expanded tells screen readers whether the panel is open
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={
              isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
          >
            {isOpen ? (
              <HiOutlineX size={28} aria-hidden="true" />
            ) : (
              <HiOutlineMenuAlt3 size={28} aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu Panel ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu" // [8] matches aria-controls on hamburger
            role="navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10 bg-black/95 md:hidden"
          >
            <ul role="list" className="space-y-1 px-6 py-5">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={`block rounded-lg px-4 py-3 font-heading text-lg transition-all
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black
                      ${
                        pathname === link.href
                          ? "bg-[#F5A623]/10 text-[#F5A623]"
                          : "text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}

              {/* [7] Mobile Contact link — mirrors desktop CTA */}
              <li>
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 block rounded-full bg-[#F5A623] px-4 py-3 text-center font-semibold text-black
                    transition-all hover:bg-amber-400
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5A623]"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CartDrawer — [1] drawer-only, no /cart route dependency */}
      <CartDrawer
        open={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          window.dispatchEvent(new Event("cart-close"));
        }}
      />
    </motion.header>
  );
}
