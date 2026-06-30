"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Fragment, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiShoppingBag, FiX, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import CartItem from "./CartItem";
import LoginModal from "@/components/auth/LoginModal";

const fieldCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white text-sm " +
  "placeholder:text-zinc-500 outline-none transition-colors duration-200 " +
  "focus:border-amber-400/60 focus:bg-white/8 hover:border-white/20";

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user, profile, profileComplete } = useAuth();
  const router = useRouter();

  const userEmail = user?.email || "";

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(false);
  const [step, setStep] = useState(1);

  const [bookingData, setBookingData] = useState({
    fullName: "",
    phone: "",
    address: "",
    bookingDate: "",
    pickupTime: "",
    notes: "",
    idProofConfirmed: false,
  });

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price, 0),
    [cart],
  );

  const showDrawer = open && !showBookingForm && !showLogin;

  const handleField = (field) => (e) =>
    setBookingData((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePhone = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setBookingData((prev) => ({ ...prev, phone: digits }));
  };

  const handleIdProofToggle = (e) => {
    setBookingData((prev) => ({ ...prev, idProofConfirmed: e.target.checked }));
  };

  const resetForm = () => {
    setBookingData({
      fullName: "",
      phone: "",
      address: "",
      bookingDate: "",
      pickupTime: "",
      notes: "",
      idProofConfirmed: false,
    });
    setStep(1);
  };

  // Resume booking if user completed profile elsewhere
  useEffect(() => {
    const handleResume = () => {
      if (!user) {
        setPendingBooking(true);
        setShowLogin(true);
        return;
      }
      if (!profileComplete) {
        router.push("/profile");
        return;
      }

      setBookingData((prev) => ({
        ...prev,
        fullName: profile.name || prev.fullName,
        phone: profile.phoneNumber || prev.phone,
        address: profile.address || prev.address,
      }));
      setStep(1);
      setShowBookingForm(true);
    };

    window.addEventListener("resume-pending-booking", handleResume);
    return () =>
      window.removeEventListener("resume-pending-booking", handleResume);
  }, [user, profile, profileComplete, router]);

  const handleBookingStart = () => {
    if (!user) {
      setPendingBooking(true);
      setShowLogin(true);
      return;
    }

    if (!profileComplete) {
      // Preserve cart and indicate pending booking flow
      setPendingBooking(true);
      localStorage.setItem("fcr-pending-booking", "1");
      toast.error(
        "Please complete your profile before continuing with your booking.",
      );
      router.push("/profile");
      return;
    }

    setBookingData((prev) => ({
      ...prev,
      fullName: profile.name || prev.fullName,
      phone: profile.phoneNumber || prev.phone,
      address: profile.address || prev.address,
    }));
    setStep(1);
    setShowBookingForm(true);
  };

  const closeLogin = () => {
    setShowLogin(false);
    setPendingBooking(false);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (pendingBooking) {
      setPendingBooking(false);
      // If profile is incomplete, redirect to profile page where
      // after saving the profile the user will be routed back.
      if (!profileComplete) {
        toast.error("Complete your profile before booking.");
        router.push("/profile");
        return;
      }

      setBookingData((prev) => ({
        ...prev,
        fullName: profile.name || prev.fullName,
        phone: profile.phoneNumber || prev.phone,
        address: profile.address || prev.address,
      }));
      setStep(1);
      setShowBookingForm(true);
    }
  };

  const closeBookingForm = () => {
    setShowBookingForm(false);
    setStep(1);
  };

  const handleNext = () => {
    const { bookingDate, pickupTime, idProofConfirmed } = bookingData;

    if (!bookingDate) {
      toast.error("Please select a booking date.");
      return;
    }
    if (!pickupTime) {
      toast.error("Please select a pickup time.");
      return;
    }
    if (!idProofConfirmed) {
      toast.error(
        "Please confirm that you will carry a valid government ID proof.",
      );
      return;
    }

    setStep(2);
  };

  const canProceedToReview = Boolean(
    bookingData.bookingDate &&
    bookingData.pickupTime &&
    bookingData.idProofConfirmed,
  );

  const handleWhatsApp = async () => {
    const { fullName, phone, address, bookingDate, pickupTime, notes } =
      bookingData;

    if (!user?.email) {
      toast.error("Please login before booking.");
      return;
    }

    if (!cart.length) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      const bookingPayloads = cart.map((item) => ({
        customerId: profile?.customerId || null,
        fullName: fullName.trim(),
        email: user.email,
        phone: phone,
        address: address.trim(),
        productId: item.id,
        productName: item.name,
        productImage: item.image || null,
        rentalDuration: item.duration,
        quantity: item.quantity || 1,
        rentalPrice: Number(item.price || 0),
        totalAmount: Number(item.price || 0) * Number(item.quantity || 1),
        bookingDate,
        pickupTime,
        notes: notes.trim(),
      }));

      const responses = await Promise.all(
        bookingPayloads.map((payload) =>
          fetch("/api/rental-requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        ),
      );

      const failed = responses.find((response) => !response.ok);
      if (failed) {
        const errorResult = await failed.json().catch(() => null);
        throw new Error(
          errorResult?.message || "Failed to save booking request",
        );
      }

      const itemLines = cart
        .map(
          (item, i) =>
            `\n📷 Item ${i + 1}\n` +
            `   Equipment      : ${item.name}\n` +
            `   Rental Duration: ${item.duration}\n` +
            `   Quantity       : ${item.quantity || 1}\n` +
            `   Price          : ₹${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-IN")}`,
        )
        .join("\n");
      const emailLine = userEmail ? `Email   : ${userEmail}\n` : "";
      const addressLine = address ? `Address : ${address}\n` : "";
      const bookingIds = (
        await Promise.all(responses.map((response) => response.json()))
      )
        .map((result) => result.data?.requestId || "")
        .filter(Boolean);
      const bookingIdLine = bookingIds.length
        ? `Booking ID(s) : ${bookingIds.join(", ")}\n`
        : "";
      const message =
        `Hello Friendly Camera Rentals! 👋\n\n` +
        `📋 *Customer Details*\n━━━━━━━━━━━━━━━━━━━━\n` +
        `Name    : ${fullName.trim()}\nPhone   : ${phone}\n${emailLine}${addressLine}` +
        `📅 *Booking Date* : ${bookingDate}\n⏰ *Pickup Time*  : ${pickupTime}\n` +
        `🆔 *Government ID Proof* : Yes (Customer Confirmed)\n${bookingIdLine}\n` +
        `📸 *Rental Items*\n━━━━━━━━━━━━━━━━━━━━${itemLines}\n━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 *Total Amount* : ₹${total.toLocaleString("en-IN")}\n\n📝 *Notes*\n${notes.trim() || "N/A"}`;

      window.open(
        `https://wa.me/918639852224?text=${encodeURIComponent(message)}`,
        "_blank",
      );
      clearCart();
      closeBookingForm();
      resetForm();
      toast.success("Booking saved and WhatsApp opened.");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save booking request");
    }
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ✅ Booking modal rendered via Portal — completely outside parent DOM tree
  const bookingModal = showBookingForm
    ? createPortal(
        <AnimatePresence>
          <motion.div
            key="booking-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBookingForm}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "512px",
                maxHeight: "calc(100dvh - 32px)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(14,14,14,0.92)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
              }}
            >
              {/* ── Step indicator + close ── */}
              <div className="flex shrink-0 items-center justify-between px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? "w-6 bg-amber-400" : "w-2 bg-amber-400/40"}`}
                    />
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? "w-6 bg-amber-400" : "w-2 bg-white/20"}`}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">
                    Step {step} of 2 —{" "}
                    {step === 1 ? "Your Details" : "Review & Confirm"}
                  </span>
                </div>
                <button
                  onClick={closeBookingForm}
                  aria-label="Close"
                  className="cursor-pointer rounded-full border border-white/10 p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* ── Step 1 ── */}
              {step === 1 && (
                <>
                  <div className="flex-1 overflow-y-auto px-6 pb-2">
                    <h2 className="mb-1 text-xl font-semibold text-white">
                      Booking Details
                    </h2>
                    <p className="mb-6 text-sm text-zinc-500">
                      Choose your pickup details and confirm your ID proof for
                      collection.
                    </p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                            Booking Date
                          </label>
                          <input
                            type="date"
                            value={bookingData.bookingDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={handleField("bookingDate")}
                            className={fieldCls}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                            Pickup Time
                          </label>
                          <input
                            type="time"
                            value={bookingData.pickupTime}
                            onChange={handleField("pickupTime")}
                            className={fieldCls}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Notes{" "}
                          <span className="normal-case text-zinc-600">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Any special requirements..."
                          value={bookingData.notes}
                          onChange={handleField("notes")}
                          className={`${fieldCls} resize-none`}
                        />
                      </div>

                      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                        <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-200">
                          <input
                            type="checkbox"
                            checked={bookingData.idProofConfirmed}
                            onChange={handleIdProofToggle}
                            className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-amber-400"
                          />
                          <span>
                            <span className="font-medium text-white">
                              I will Submit Valid ID proof (Driving License /
                              Aadhaar Card / PAN Card) while collecting the
                              equipment.
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div
                    className="shrink-0 flex gap-3 px-6 py-5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <button
                      onClick={closeBookingForm}
                      className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!canProceedToReview}
                      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 text-sm font-semibold text-black transition active:scale-[0.98] ${
                        canProceedToReview
                          ? "cursor-pointer hover:bg-amber-300"
                          : "cursor-not-allowed bg-amber-400/50 text-black/70"
                      }`}
                    >
                      Next <FiArrowRight size={16} />
                    </button>
                  </div>
                </>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <>
                  <div className="flex-1 overflow-y-auto px-6 pb-2">
                    <h2 className="mb-1 text-xl font-semibold text-white">
                      Review & Confirm
                    </h2>
                    <p className="mb-6 text-sm text-zinc-500">
                      Check your details before sending to WhatsApp.
                    </p>

                    <div className="mb-5 space-y-3">
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                          Customer Details
                        </p>
                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-zinc-500">Full Name</p>
                            <p className="mt-0.5 font-medium text-white">
                              {bookingData.fullName || "Not available"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">
                              Phone Number
                            </p>
                            <p className="mt-0.5 font-medium text-white">
                              {bookingData.phone || "Not available"}
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-xs text-zinc-500">Address</p>
                            <p className="mt-0.5 font-medium text-white">
                              {bookingData.address || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                          Booking Details
                        </p>
                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-zinc-500">
                              Booking Date
                            </p>
                            <p className="mt-0.5 font-medium text-white">
                              {bookingData.bookingDate
                                ? new Date(
                                    bookingData.bookingDate,
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Not selected"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">Pickup Time</p>
                            <p className="mt-0.5 font-medium text-white">
                              {bookingData.pickupTime || "Not selected"}
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-xs text-zinc-500">Notes</p>
                            <p className="mt-0.5 text-sm text-white">
                              {bookingData.notes.trim() ||
                                "No additional notes"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-300">
                          ID PROOF
                        </p>
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 text-lg text-emerald-300">
                            ✓
                          </span>
                          <p className="text-sm text-zinc-200">Accepted</p>
                        </div>
                        <p className="mt-2 text-sm text-zinc-400">
                          I agree to bring a valid ID Proof during equipment
                          pickup.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Order Summary
                      </p>
                      <div className="space-y-2">
                        {cart.map((item, index) => {
                          const lineTotal =
                            Number(item.price || 0) *
                            Number(item.quantity || 1);
                          return (
                            <div
                              key={`review-${item.id || index}-${item.duration}`}
                              className="rounded-xl bg-white/5 p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-900">
                                    <Image
                                      src={
                                        item.image || "/images/placeholder.png"
                                      }
                                      alt={item.name || "Product image"}
                                      fill
                                      sizes="56px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-white">
                                      {item.name}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                      Rental Duration:{" "}
                                      <span className="text-amber-400">
                                        {item.duration}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <p className="shrink-0 mt-5 mr-3 text-sm font-bold text-amber-400">
                                  ₹{lineTotal.toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        {/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */}
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-400/10 px-4 py-3 ring-1 ring-amber-400/25">
                        <span className="text-sm font-semibold text-zinc-300">
                          Total Price
                        </span>
                        <span className="text-xl font-bold text-white">
                          ₹{total.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="shrink-0 flex gap-3 px-6 py-5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/10 cursor-pointer"
                    >
                      <FiArrowLeft size={16} /> Back
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 px-2 text-sm font-semibold text-black transition hover:bg-amber-300 active:scale-[0.98] cursor-pointer"
                    >
                      <FaWhatsapp
                        size={24}
                        className="text-green-500 font-extrabold"
                      />{" "}
                      Continue to WhatsApp
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body, // ✅ Renders directly into body, escapes any parent overflow/transform
      )
    : null;

  return (
    <>
      <AnimatePresence>
        {/* ── Cart Drawer ── */}
        {showDrawer && (
          <Fragment key="cart-drawer">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-[999] flex w-full max-w-md flex-col border-l border-white/10 bg-black"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
                <h2 className="text-xl font-semibold text-white sm:text-2xl">
                  Your Cart
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Close cart"
                  className="cursor-pointer rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  <FiX size={22} />
                </button>
              </div>

              <div
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  overscroll-contain
                  p-4
                  pb-52
                  sm:p-5
                  sm:pb-56
                "
              >
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <FiShoppingBag size={70} className="text-zinc-700" />
                    <h3 className="mt-5 text-xl font-semibold text-white sm:text-2xl">
                      Your cart is empty
                    </h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      Add rental equipment to continue.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        setTimeout(() => router.push("/rental"), 200);
                      }}
                      className="mt-6 cursor-pointer rounded-full border border-white/10 px-6 py-3 text-sm text-white transition hover:border-[#F5A623] hover:text-[#F5A623]"
                    >
                      Continue Browsing
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <CartItem
                        key={`${item.id || "item"}-${item.duration || "duration"}-${index}`}
                        item={item}
                        onRemove={() => removeFromCart(item.id, item.duration)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div
                  className="
                    sticky
                    bottom-0
                    z-30
                    border-t
                    border-white/10
                    bg-black/95
                    backdrop-blur-xl
                    p-4
                    pt-4
                    shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
                    supports-[padding:max(0px)]:pb-[max(16px,env(safe-area-inset-bottom))]
                    sm:p-5
                  "
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-zinc-400 text-lg">Total</span>

                    <span className="text-3xl font-bold text-amber-400">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    onClick={handleBookingStart}
                    className="
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-3
                            rounded-2xl
                            bg-green-500
                            py-4
                            text-lg
                            font-semibold
                            text-white
                            transition
                            hover:bg-green-600
                            active:scale-[0.98]
                          "
                  >
                    <FaWhatsapp size={22} />
                    Book Rent via WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          </Fragment>
        )}
      </AnimatePresence>

      {/* ✅ Portal-rendered booking modal — outside parent DOM entirely */}
      {bookingModal}

      {showLogin && (
        <LoginModal
          key="login-modal"
          open={showLogin}
          onClose={closeLogin}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}
