"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Rental", href: "/rental" },
  { name: "Buy", href: "/buy" },
  { name: "Sell", href: "/sell" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-24 max-w-7xl items-center justify-between px-2 md:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
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

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`font-heading relative text-xl font-semibold tracking-wide transition-all duration-300 ${
                    isActive
                      ? "text-[#F5A623]"
                      : "text-zinc-300 hover:text-[#F5A623]"
                  }`}
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

        {/* Right Side */}
        <div className="hidden md:block">
          <a
            href="https://wa.me/918639852224"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#F5A623] px-5 py-3 font-semibold text-black transition-all duration-300 hover:scale-105"
          >
            <FaWhatsapp size={20} />
            WhatsApp
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white md:hidden"
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <HiOutlineX size={28} />
          ) : (
            <HiOutlineMenuAlt3 size={28} />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10 bg-black/95 md:hidden"
          >
            <div className="space-y-2 px-6 py-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-4 py-3 font-heading text-lg transition-all ${
                    pathname === link.href
                      ? "bg-[#F5A623]/10 text-[#F5A623]"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <a
                href="https://wa.me/918639852224"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#F5A623] px-5 py-3 font-semibold text-black"
              >
                <FaWhatsapp size={20} />
                WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
