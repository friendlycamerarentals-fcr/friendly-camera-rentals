"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { FaShoppingCart } from "react-icons/fa";
import CartDrawer from "@/components/cart/CartDrawer";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useBookingFlow } from "@/context/BookingFlowContext";
import LoginModal from "@/components/auth/LoginModal";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Rental", href: "/rental" },
  { name: "Buy", href: "/buy" },
  { name: "Sell", href: "/sell" },
  { name: "Services", href: "/services" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const {
    isCartVisible,
    isProfileVisible,
    openCart,
    closeCart,
    openProfile,
    closeProfile,
  } = useBookingFlow();

  const [showLogin, setShowLogin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Each item is qty 1
  const cartCount = useMemo(() => cart.length, [cart.length]);

  // ── Auth loading state ──────────────────────────────────────────────────
  // Firebase/auth context may return undefined while resolving the session.
  // We treat undefined as "still loading" and null as "confirmed guest".
  const isAuthLoading = user === undefined;

  // Auto-show login modal after 30 s for confirmed guests (once per session)
  useEffect(() => {
    // Wait until auth has resolved before starting the timer
    if (isAuthLoading) return;

    // Already logged in — never show
    if (user) return;

    // Already shown before — never show again (persists across reloads)
    if (localStorage.getItem("fcr-login-shown")) return;

    const DELAY = 30_000; // change to e.g. 5_000 while testing

    const timer = setTimeout(() => {
      setShowLogin(true);
      localStorage.setItem("fcr-login-shown", "true");
    }, DELAY);

    return () => clearTimeout(timer);
  }, [user, isAuthLoading]);

  const handleOpenCart = useCallback(() => {
    setIsOpen(false);
    openCart();
  }, [openCart]);

  const handleCloseCart = useCallback(() => {
    closeCart();
  }, [closeCart]);

  // Listen for resume booking events and open cart
  useEffect(() => {
    const resumeListener = () => openCart();
    const openLoginListener = () => {
      closeCart();
      setShowLogin(true);
    };
    const openCartListener = () => openCart();

    window.addEventListener("resume-pending-booking", resumeListener);
    window.addEventListener("open-login-modal", openLoginListener);
    window.addEventListener("open-cart-drawer", openCartListener);

    return () => {
      window.removeEventListener("resume-pending-booking", resumeListener);
      window.removeEventListener("open-login-modal", openLoginListener);
      window.removeEventListener("open-cart-drawer", openCartListener);
    };
  }, [openCart, closeCart]);

  const handleOpenLogin = useCallback(() => {
    if (isCartVisible) {
      closeCart();
    }
    setShowLogin(true);
    setIsOpen(false);
  }, [closeCart, isCartVisible]);

  const handleCloseLogin = useCallback(() => {
    setShowLogin(false);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setShowLogin(false);
    if (localStorage.getItem("fcr-pending-booking")) {
      window.dispatchEvent(new Event("resume-pending-booking"));
    }
  }, []);

  const handleOpenProfile = useCallback(() => {
    if (pathname === "/profile" || isProfileVisible) return;

    if (isCartVisible) {
      closeCart();
    }
    setIsOpen(false);
    openProfile({ restoreCartAfterProfile: false });
    if (pathname !== "/profile") {
      router.push("/profile");
    }
  }, [
    closeCart,
    isCartVisible,
    isProfileVisible,
    openProfile,
    pathname,
    router,
  ]);

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
        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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

        {/* ── Desktop Nav Links ── */}
        <ul role="list" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`font-heading relative text-xl font-semibold tracking-wide transition-all duration-300
                    rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black
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

        {/* ── Desktop Right Side ── */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenProfile}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <ProfileAvatar
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  size={40}
                />
              </button>
              <button
                onClick={logout}
                className="cursor-pointer rounded-full border border-red-500/20 px-4 py-2 text-red-400 transition hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleOpenLogin}
              className="cursor-pointer rounded-full border border-white/10 px-5 py-3 text-white transition hover:border-[#F5A623] hover:text-[#F5A623]"
            >
              Login
            </button>
          )}

          {/* Cart */}
          <button
            onClick={handleOpenCart}
            aria-label={
              cartCount > 0
                ? `Open cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`
                : "Open cart"
            }
            className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white
              transition-all duration-300 hover:border-[#F5A623] hover:text-[#F5A623]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <FaShoppingCart size={18} aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#F5A623] text-xs font-bold text-black">
                {cartCount}
              </span>
            )}
          </button>

          {/* Contact */}
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

        {/* ── Mobile Controls (profile + cart + hamburger) ── */}
        <div className="flex items-center gap-5 pr-3 md:hidden">
          {/* Profile avatar or Login button */}
          {user ? (
            <button
              type="button"
              onClick={handleOpenProfile}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer"
            >
              <ProfileAvatar
                src={user.photoURL}
                alt={user.displayName || "User"}
                size={36}
              />
            </button>
          ) : (
            <button
              onClick={handleOpenLogin}
              className="cursor-pointer rounded-full border border-white/10 px-3 py-1.5 text-sm text-white transition hover:border-[#F5A623] hover:text-[#F5A623] cursor-pointer"
            >
              Login
            </button>
          )}

          {/* Cart */}
          <button
            onClick={handleOpenCart}
            aria-label={
              cartCount > 0
                ? `Open cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`
                : "Open cart"
            }
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-[#F5A623] hover:text-[#F5A623]"
          >
            <FaShoppingCart size={15} aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F5A623] text-[10px] font-bold text-black">
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen((p) => !p)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={
              isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="rounded text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {isOpen ? (
              <HiOutlineX size={26} />
            ) : (
              <HiOutlineMenuAlt3 size={26} />
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="border-t border-white/10 bg-black/95 md:hidden"
          >
            <div className="px-6 py-5 space-y-1">
              {/* Nav links */}
              <ul role="list" className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={`block rounded-lg px-4 py-3 font-heading text-lg transition-all
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]
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
              </ul>

              {/* Divider */}
              <div className="my-3 border-t border-white/10" />

              {/* ── Mobile Login / User section ── */}
              {user ? (
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      size={38}
                    />
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate max-w-[160px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {/* Logout */}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="cursor-pointer rounded-full border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleOpenLogin}
                  className="w-full cursor-pointer rounded-2xl border border-white/10 py-3 text-center text-base font-medium text-white transition hover:border-[#F5A623] hover:text-[#F5A623]"
                >
                  Login
                </button>
              )}

              {/* Contact CTA */}
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="mt-1 block rounded-full bg-[#F5A623] px-4 py-3 text-center font-semibold text-black transition hover:bg-amber-400"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CartDrawer */}
      <CartDrawer open={isCartVisible} onClose={handleCloseCart} />

      {/* LoginModal */}
      <LoginModal
        open={showLogin}
        onClose={handleCloseLogin}
        onLoginSuccess={handleLoginSuccess}
      />
    </motion.header>
  );
}
