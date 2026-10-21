export const FCR_WHATSAPP_COUNTRY_CODE = "91";

/**
 * Normalize an Indian phone number for the wa.me click-to-chat URL.
 * Uses the number stored on the booking (persisted data), never client-only
 * values, and strips formatting before adding the country code.
 */
export function normalizeWhatsAppPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) {
    return `${FCR_WHATSAPP_COUNTRY_CODE}${digits}`;
  }
  if (digits.startsWith(FCR_WHATSAPP_COUNTRY_CODE) && digits.length === 12) {
    return digits;
  }
  return digits;
}

const inr = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const divider = "\n━━━━━━━━━━━━━━━━━━━━\n";

/**
 * Build the admin WhatsApp message from the SAVED booking record.
 *
 * Financial values (original amount, reward discount, final amount, advance
 * received, remaining balance) are read from the persisted booking only —
 * the caller never reconstructs amounts in the frontend.
 */
export function buildRentalWhatsAppMessage(booking = {}) {
  if (!booking?.requestId) return "";

  const items = Array.isArray(booking.items)
    ? booking.items.filter(Boolean)
    : [];
  const originalAmount = Number(
    booking.originalAmount ??
      Number(booking.totalAmount || 0) + Number(booking.rewardDiscount || 0),
  );
  const rewardDiscount = Number(booking.rewardDiscount || 0);
  const finalAmount = Number(
    booking.totalAmount ??
      Math.max(originalAmount - rewardDiscount, 0),
  );
  const expectedAdvance = Number(booking.advanceExpected || 0);
  const advanceReceived = Number(booking.advanceAmount || 0);
  const remaining = Math.max(finalAmount - advanceReceived, 0);

  const lines = [];
  lines.push(`Hello ${booking.fullName || "Customer"}! 👋`);
  lines.push("");
  lines.push(`📋 *Booking ID* : ${booking.requestId}`);

  if (items.length) {
    lines.push("📸 *Rental Items*");
    items.forEach((item, index) => {
      const duration = item.durationDisplay || item.durationValue
        ? `${item.durationDisplay || ""}`
        : item.duration || "";
      lines.push(
        `${index + 1}. ${item.productName} · ${duration} — ${inr(item.rentalPrice)}`,
      );
    });
  } else {
    lines.push(`📸 *Rental Item* : ${booking.productName}`);
    lines.push(
      `🔢 *Quantity* : ${booking.quantity || 1} · *Duration* : ${booking.rentalDuration}`,
    );
  }
  lines.push(`📅 *Booking Date* : ${booking.bookingDate || "—"}`);
  lines.push(`⏰ *Pickup Time* : ${booking.pickupTime || "—"}`);
  lines.push(divider);
  lines.push("💰 *Payment Breakdown*");
  if (rewardDiscount > 0) {
    lines.push(`Original Amount : ${inr(originalAmount)}`);
    lines.push(`🎁 Reward Discount : -${inr(rewardDiscount)}`);
  }
  lines.push(`Final Rental Amount : ${inr(finalAmount)}`);
  if (expectedAdvance > 0 && advanceReceived <= 0) {
    lines.push(`Advance Expected : ${inr(expectedAdvance)}`);
  }
  if (advanceReceived > 0) {
    lines.push(`✅ Advance Received : ${inr(advanceReceived)}`);
    if (booking.advancePaymentMethod) {
      lines.push(`Payment Method : ${booking.advancePaymentMethod}`);
    }
  }
  lines.push(`Remaining Amount : ${inr(remaining)}`);
  lines.push(divider);

  if (booking.status === "Confirmed") {
    lines.push("✅ *Rental Confirmed*");
    lines.push(
      "Your rental is confirmed. See you at pickup — please bring a government ID proof. 🎉",
    );
  } else if (booking.status === "Completed") {
    lines.push("🏁 *Rental Completed*");
    lines.push("Thank you for renting with Friendly Camera Rentals! 💛");
  } else {
    lines.push("⏳ *Rental Request Received — Awaiting Advance Payment*");
    lines.push(
      "Your rental request is received but not yet confirmed. Kindly pay the advance to confirm your booking.",
    );
  }

  return lines.join("\n");
}

/**
 * Open WhatsApp for a booking with a prefilled message.
 * Click-to-chat only prefills the message — the admin presses Send.
 */
export function openRentalWhatsApp(booking = {}) {
  const phone = normalizeWhatsAppPhone(booking.phone);
  if (!phone) {
    return false;
  }
  const message = buildRentalWhatsAppMessage(booking);
  const url = `https://wa.me/${phone}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
  window.open(url, "_blank");
  return true;
}
