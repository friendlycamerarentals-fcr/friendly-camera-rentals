import test from "node:test";
import assert from "node:assert/strict";
import { buildRentalWhatsAppMessage } from "./whatsappBookingMessage.js";

test("includes updated rental item quantities and line totals in WhatsApp messages", () => {
  const message = buildRentalWhatsAppMessage({
    requestId: "FCR-R100011",
    fullName: "Customer",
    totalAmount: 1300,
    items: [
      {
        productName: "Canon EOS 80D",
        durationDisplay: "5 Hours",
        rentalPrice: 500,
        quantity: 2,
      },
    ],
  });

  assert.match(message, /Canon EOS 80D · 5 Hours — ₹500 × 2 = ₹1,000/);
  assert.match(message, /Final Rental Amount : ₹1,300/);
});
