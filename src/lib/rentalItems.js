import {
  fromPaise,
  getDurationListingPrice,
  parsePricingKey,
  sumPaise,
  toPaise,
} from "./rentalDuration.js";

export const MAX_RENTAL_ITEMS = 20;
export const MAX_RENTAL_ITEM_PRICE = 10_000_000;

export function validateRentalQuantity(rawQuantity = 1) {
  const quantity = Number(rawQuantity);
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    return {
      ok: false,
      message: "Quantity must be a positive whole number.",
    };
  }
  return { ok: true, value: quantity };
}

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
  return { ok: true, value: fromPaise(toPaise(price)) };
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
      message: "That duration does not have a configured price for this product.",
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

export function getRentalItemsTotal(items = []) {
  return fromPaise(
    sumPaise(
      (Array.isArray(items) ? items : []).map(
        (item) =>
          Number(item.rentalPrice) * Number(item.quantity ?? 1),
      ),
    ),
  );
}
