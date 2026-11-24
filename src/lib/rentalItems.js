import {
  DURATION_UNITS,
  formatDuration,
  fromPaise,
  getDurationListingPrice,
  parsePricingKey,
  sumPaise,
  toPaise,
} from "./rentalDuration.js";

export const MAX_RENTAL_ITEMS = 20;
export const MAX_RENTAL_ITEM_PRICE = 10_000_000;
export const CUSTOM_DURATION_KEY = "__custom__";

export function validateAgreedRentalPrice(rawPrice) {
  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price <= 0) {
    return {
      ok: false,
      message: "Rental price must be a positive amount.",
    };
  }
  if (price > MAX_RENTAL_ITEM_PRICE) {
    return {
      ok: false,
      message: `Rental price exceeds the allowed limit of ₹${MAX_RENTAL_ITEM_PRICE.toLocaleString("en-IN")}.`,
    };
  }
  const roundedPrice = fromPaise(toPaise(price));
  if (roundedPrice <= 0) {
    return {
      ok: false,
      message: "Rental price must be a positive amount.",
    };
  }
  return { ok: true, value: roundedPrice };
}

export function resolveConfiguredRentalPrice(product, durationKey, rawAgreedPrice) {
  const duration = parsePricingKey(durationKey);
  if (!duration) {
    return { ok: false, message: "Select a valid configured rental duration." };
  }

  const configuredPrice = Number(
    getDurationListingPrice(product, {
      type: "standard",
      key: durationKey,
    }),
  );
  if (!Number.isFinite(configuredPrice) || configuredPrice <= 0) {
    return {
      ok: false,
      message: "The selected duration is not configured for this product.",
    };
  }

  const agreedPrice =
    rawAgreedPrice == null || rawAgreedPrice === ""
      ? { ok: true, value: configuredPrice }
      : validateAgreedRentalPrice(rawAgreedPrice);
  if (!agreedPrice.ok) return agreedPrice;

  return {
    ok: true,
    duration,
    configuredPrice,
    rentalPrice: agreedPrice.value,
    isCustomPrice:
      toPaise(agreedPrice.value) !== toPaise(configuredPrice),
  };
}

export function resolveCustomRentalItemPrice(rawDuration, rawAgreedPrice) {
  const value = Number(rawDuration?.value);
  const unit = rawDuration?.unit;
  if (
    rawDuration?.value == null ||
    rawDuration.value === "" ||
    !["number", "string"].includes(typeof rawDuration.value) ||
    !Number.isSafeInteger(value) ||
    value < 1 ||
    ![DURATION_UNITS.HOURS, DURATION_UNITS.DAYS].includes(unit)
  ) {
    return {
      ok: false,
      message: "Enter a whole-number duration of at least 1 and choose Hours or Days.",
    };
  }

  const agreedPrice = validateAgreedRentalPrice(rawAgreedPrice);
  if (!agreedPrice.ok) return agreedPrice;

  const duration = { value, unit };
  return {
    ok: true,
    duration,
    durationDisplay: formatDuration(duration),
    rentalPrice: agreedPrice.value,
    isCustomDuration: true,
    isCustomPrice: true,
  };
}

export function getRentalBookingOriginalAmount(booking = {}) {
  return Number(
    booking.originalAmount ??
      Number(booking.totalAmount || 0) + Number(booking.rewardDiscount || 0),
  );
}

export function getRentalItemsTotal(items = []) {
  return fromPaise(
    sumPaise(
      (Array.isArray(items) ? items : []).map(
        (item) => Number(item.rentalPrice),
      ),
    ),
  );
}
