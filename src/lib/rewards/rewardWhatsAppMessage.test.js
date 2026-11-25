import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRewardWhatsAppMessage,
  formatRewardExpiryDate,
  normalizeRewardWhatsAppPhone,
} from "./rewardWhatsAppMessage.js";

test("builds a dynamic rupee reward WhatsApp message", () => {
  const message = buildRewardWhatsAppMessage({
    customerName: "Pavan",
    rewardAmount: 40,
    expireDate: "2026-09-27",
  });

  assert.equal(
    message,
    "Dear Pavan\n\nThank you for moving with FCR\n\nYou got Reward points 40 For your last order\n\nClaim this points on your next order\n\nAvailable balance 40\n\nValid upto 27/09/2026",
  );
});

test("uses a different reward amount and date without shifting timezone", () => {
  const message = buildRewardWhatsAppMessage({
    customerName: "Actual Customer",
    rewardAmount: 143,
    expireDate: "2026-09-27",
  });

  assert.match(message, /Reward points 143/);
  assert.match(message, /Available balance 143/);
  assert.match(message, /27\/09\/2026/);
  assert.equal(formatRewardExpiryDate("2026-09-27"), "27/09/2026");
});

test("normalizes Indian reward phone numbers without duplicating 91", () => {
  assert.equal(normalizeRewardWhatsAppPhone("9391340375"), "919391340375");
  assert.equal(normalizeRewardWhatsAppPhone("+91 93913-40375"), "919391340375");
  assert.equal(normalizeRewardWhatsAppPhone("0919391340375"), "919391340375");
  assert.equal(normalizeRewardWhatsAppPhone(""), "");
  assert.equal(normalizeRewardWhatsAppPhone("123"), "");
});
