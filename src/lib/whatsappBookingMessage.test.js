import test from "node:test";
import assert from "node:assert/strict";
import { buildRentalWhatsAppMessage } from "./whatsappBookingMessage.js";

test("shows rental item prices without multiplying them", () => {
  const message = buildRentalWhatsAppMessage({
    requestId: "FCR-R100011",
    fullName: "Customer",
    totalAmount: 1300,
    items: [
      {
        productName: "Canon EOS 80D",
        durationDisplay: "5 Hours",
        rentalPrice: 500,
      },
    ],
  });

  assert.match(message, /Canon EOS 80D · 5 Hours — ₹500/);
  assert.match(message, /Final Rental Amount : ₹1,300/);
});

test("uses stored totals for a legacy booking without item rows", () => {
  const message = buildRentalWhatsAppMessage({
    requestId: "FCR-R100006",
    fullName: "Customer",
    productName: "Camera",
    rentalDuration: "5 Hours",
    rentalPrice: 500,
    totalAmount: 1000,
    originalAmount: 1000,
    items: [],
  });

  assert.match(message, /Final Rental Amount : ₹1,000/);
  assert.match(message, /Camera/);
});
